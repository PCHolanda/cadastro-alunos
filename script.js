// DOM Elements
const modalOverlay = document.getElementById('modalOverlay');
const btnOpenModal = document.getElementById('btnOpenModal');
const btnCloseModal = document.getElementById('btnCloseModal');
const btnCancel = document.getElementById('btnCancel');
const studentForm = document.getElementById('studentForm');
const studentList = document.getElementById('studentList');

// API URL
const API_URL = '/api/students';

// State
let editingId = null;

// Functions
function openModal(student = null) {
    modalOverlay.classList.remove('hidden');
    if (student) {
        // Edit mode
        editingId = student.id;
        document.getElementById('name').value = student.name;
        document.getElementById('email').value = student.email;
        document.getElementById('phone').value = student.phone;
        document.querySelector('.modal-header h2').textContent = 'Editar Aluno';
    } else {
        // Create mode
        editingId = null;
        studentForm.reset();
        document.querySelector('.modal-header h2').textContent = 'Novo Aluno';
    }
    setTimeout(() => document.getElementById('name').focus(), 100);
}

function closeModal() {
    modalOverlay.classList.add('hidden');
    studentForm.reset();
    editingId = null;
}

async function fetchStudents() {
    try {
        const response = await fetch(API_URL);
        const students = await response.json();
        renderTable(students);
    } catch (error) {
        console.error('Error fetching students:', error);
        alert('Erro ao carregar alunos. Verifique se o servidor está rodando.');
    }
}

function renderTable(students) {
    studentList.innerHTML = '';

    if (students.length === 0) {
        studentList.innerHTML = `
            <tr class="empty-state">
                <td colspan="4">Nenhum aluno cadastrado.</td>
            </tr>
        `;
        return;
    }

    students.forEach((student) => {
        const tr = document.createElement('tr');
        // Encode student data to pass safely to edit function
        const studentData = JSON.stringify(student).replace(/"/g, '&quot;');

        tr.innerHTML = `
            <td>
                <div style="font-weight: 500; color: #111827;">${student.name}</div>
            </td>
            <td>${student.email}</td>
            <td>${student.phone}</td>
            <td style="text-align: right; white-space: nowrap;">
                <button class="btn-icon" onclick="editStudent(JSON.parse('${studentData}'))" title="Editar" style="margin-right: 0.5rem; color: #4F46E5;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                </button>
                <button class="btn-icon" onclick="removeStudent(${student.id})" title="Remover">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: #EF4444;"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
            </td>
        `;
        studentList.appendChild(tr);
    });
}

function editStudent(student) {
    openModal(student);
}

async function handleFormSubmit(event) {
    event.preventDefault();

    const formData = new FormData(studentForm);
    const studentData = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone')
    };

    try {
        let url = API_URL;
        let method = 'POST';

        if (editingId) {
            url = `${API_URL}/${editingId}`;
            method = 'PUT';
        }

        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(studentData)
        });

        if (response.ok) {
            fetchStudents(); // Refresh list
            closeModal();
        } else {
            const errorData = await response.json();
            alert(`Erro: ${errorData.error || 'Erro ao salvar aluno.'}`);
        }
    } catch (error) {
        console.error('Error saving student:', error);
        alert(`Erro de conexão: ${error.message}`);
    }
}

async function removeStudent(id) {
    if (confirm('Tem certeza que deseja remover este aluno?')) {
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                fetchStudents(); // Refresh list
            } else {
                alert('Erro ao remover aluno.');
            }
        } catch (error) {
            console.error('Error deleting student:', error);
        }
    }
}

// Event Listeners
btnOpenModal.addEventListener('click', () => openModal());
btnCloseModal.addEventListener('click', closeModal);
btnCancel.addEventListener('click', closeModal);
studentForm.addEventListener('submit', handleFormSubmit);

// Close modal when clicking outside
modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
        closeModal();
    }
});

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modalOverlay.classList.contains('hidden')) {
        closeModal();
    }
});

// Phone Mask
const phoneInput = document.getElementById('phone');
phoneInput.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);

    if (value.length > 10) {
        // (11) 99999-9999
        value = value.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3');
    } else if (value.length > 6) {
        // (11) 9999-9999
        value = value.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3');
    } else if (value.length > 2) {
        // (11) 9999
        value = value.replace(/^(\d{2})(\d{0,5}).*/, '($1) $2');
    } else {
        // (11
        if (value.length > 0) value = value.replace(/^(\d*)/, '($1');
    }

    e.target.value = value;
});

// Initialize
fetchStudents();

// Expose functions to global scope
window.removeStudent = removeStudent;
window.editStudent = editStudent;
