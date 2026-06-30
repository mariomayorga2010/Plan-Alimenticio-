document.addEventListener('DOMContentLoaded', () => {
    
    // --- LÓGICA DE NAVEGACIÓN (SPA) ---
    const navButtons = document.querySelectorAll('.nav-btn');
    const sections = document.querySelectorAll('.view-section');

    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remover active de todos los botones y secciones
            navButtons.forEach(b => b.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));

            // Añadir active al botón presionado y su sección correspondiente
            btn.classList.add('active');
            const targetId = btn.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active');
        });
    });

    // --- LÓGICA DE PERFIL Y LOCALSTORAGE ---
    const profileForm = document.getElementById('profileForm');
    const displayData = document.getElementById('displayData');

    // Función para calcular IMC y categoría
    const calcularIMC = (peso, altura) => {
        const imc = peso / (altura * altura);
        let categoria = '';
        let badgeClass = '';

        if (imc < 18.5) {
            categoria = 'Bajo peso';
            badgeClass = 'bg-yellow';
        } else if (imc >= 18.5 && imc < 24.9) {
            categoria = 'Peso normal';
            badgeClass = 'bg-green';
        } else if (imc >= 25 && imc < 29.9) {
            categoria = 'Sobrepeso (Cuidado con el hígado graso)';
            badgeClass = 'bg-yellow';
        } else {
            categoria = 'Obesidad (Prioridad: Reducir inflamación)';
            badgeClass = 'bg-red';
        }

        return { imc: imc.toFixed(1), categoria, badgeClass };
    };

    // Función para renderizar los datos guardados
    const renderizarDatos = () => {
        const savedData = JSON.parse(localStorage.getItem('userHealthProfile'));
        
        if (savedData) {
            const { imc, categoria, badgeClass } = calcularIMC(savedData.peso, savedData.altura);
            
            displayData.innerHTML = `
                <div class="result-data">
                    <p><strong>Fecha:</strong> ${savedData.fecha}</p>
                    <p><strong>Peso:</strong> ${savedData.peso} kg</p>
                    <p><strong>Altura:</strong> ${savedData.altura} m</p>
                    <p><strong>Cintura:</strong> ${savedData.cintura} cm</p>
                    <div class="imc-badge ${badgeClass}">
                        IMC: ${imc} - ${categoria}
                    </div>
                </div>
            `;
        }
    };

    // Manejo del evento Submit
    profileForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const data = {
            fecha: document.getElementById('fecha').value,
            peso: parseFloat(document.getElementById('peso').value),
            altura: parseFloat(document.getElementById('altura').value),
            cintura: parseFloat(document.getElementById('cintura').value)
        };

        // Guardar en localStorage
        localStorage.setItem('userHealthProfile', JSON.stringify(data));
        
        // Limpiar formulario y actualizar vista
        profileForm.reset();
        renderizarDatos();
        
        alert("¡Progreso guardado exitosamente!");
    });

    // Cargar datos al iniciar la aplicación
    renderizarDatos();
});
