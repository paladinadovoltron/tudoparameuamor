// Wishlist de Presentes - JavaScript
class WishlistApp {
    constructor() {
        this.presents = this.loadFromStorage();
        this.currentFilter = 'all';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderPresents();
        this.updateStatistics();
    }

    setupEventListeners() {
        // Formulário de adicionar presente
        document.getElementById('presentForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addPresent();
        });

        // Fechar modais ao clicar fora
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.style.display = 'none';
            }
        });
    }

    // Gerenciamento de dados
    loadFromStorage() {
        const stored = localStorage.getItem('wishlist-presents');
        return stored ? JSON.parse(stored) : [];
    }

    saveToStorage() {
        localStorage.setItem('wishlist-presents', JSON.stringify(this.presents));
    }

    generateId() {
        return Date.now() + Math.random().toString(36).substr(2, 9);
    }

    // Adicionar presente
    addPresent() {
        const name = document.getElementById('presentName').value.trim();
        const description = document.getElementById('presentDescription').value.trim();
        const category = document.getElementById('presentCategory').value;
        const price = parseFloat(document.getElementById('presentPrice').value) || 0;

        if (!name) {
            alert('Nome do presente é obrigatório!');
            return;
        }

        const present = {
            id: this.generateId(),
            name: name,
            description: description,
            category: category,
            price: price,
            isGiven: false,
            dateAdded: new Date().toLocaleString('pt-BR'),
            dateGiven: null,
            notes: ''
        };

        this.presents.unshift(present);
        this.saveToStorage();
        this.renderPresents();
        this.updateStatistics();
        this.hideAddForm();
        this.showNotification('Presente adicionado com sucesso!', 'success');
    }

    // Marcar como dado
    markAsGiven(id) {
        const present = this.presents.find(p => p.id === id);
        if (present) {
            const notes = prompt('Observações sobre o presente (opcional):') || '';
            present.isGiven = true;
            present.dateGiven = new Date().toLocaleString('pt-BR');
            present.notes = notes;
            this.saveToStorage();
            this.renderPresents();
            this.updateStatistics();
            this.showNotification('Presente marcado como dado!', 'success');
        }
    }

    // Desmarcar presente
    unmarkPresent(id) {
        const present = this.presents.find(p => p.id === id);
        if (present && confirm('Desmarcar este presente?')) {
            present.isGiven = false;
            present.dateGiven = null;
            present.notes = '';
            this.saveToStorage();
            this.renderPresents();
            this.updateStatistics();
            this.showNotification('Presente desmarcado!', 'warning');
        }
    }

    // Remover presente
    removePresent(id) {
        if (confirm('Tem certeza que deseja remover este presente?')) {
            this.presents = this.presents.filter(p => p.id !== id);
            this.saveToStorage();
            this.renderPresents();
            this.updateStatistics();
            this.showNotification('Presente removido!', 'error');
        }
    }

    // Filtrar presentes
    filterPresents(filter) {
        this.currentFilter = filter;
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.classList.add('active');
        this.renderPresents();
    }

    // Renderizar presentes
    renderPresents() {
        const container = document.getElementById('presentsList');
        const emptyState = document.getElementById('emptyState');
        
        let filteredPresents = this.presents;
        
        if (this.currentFilter === 'pending') {
            filteredPresents = this.presents.filter(p => !p.isGiven);
        } else if (this.currentFilter === 'given') {
            filteredPresents = this.presents.filter(p => p.isGiven);
        }

        if (filteredPresents.length === 0) {
            container.innerHTML = '';
            emptyState.style.display = 'block';
            return;
        }

        emptyState.style.display = 'none';
        container.innerHTML = filteredPresents.map(present => this.renderPresentCard(present)).join('');
    }

    renderPresentCard(present) {
        const priceDisplay = present.price > 0 ? `R$ ${present.price.toFixed(2)}` : 'Sem preço';
        const statusClass = present.isGiven ? 'given' : '';
        const statusText = present.isGiven ? 'Dado' : 'Pendente';
        const statusIcon = present.isGiven ? 'fas fa-check-circle' : 'fas fa-clock';
        const statusBadgeClass = present.isGiven ? 'status-given' : 'status-pending';

        return `
            <div class="present-card ${statusClass}">
                <div class="present-header">
                    <div>
                        <h3 class="present-title">${present.name}</h3>
                        <span class="present-category ${statusClass}">${present.category}</span>
                    </div>
                    <div class="present-status ${statusBadgeClass}">
                        <i class="${statusIcon}"></i>
                        ${statusText}
                    </div>
                </div>
                
                ${present.description ? `<p class="present-description">${present.description}</p>` : ''}
                
                <div class="present-details">
                    <span class="present-price">${priceDisplay}</span>
                    <span class="present-date">Adicionado: ${present.dateAdded}</span>
                </div>
                
                ${present.isGiven && present.dateGiven ? `
                    <div class="present-details">
                        <span class="present-date">Dado em: ${present.dateGiven}</span>
                    </div>
                ` : ''}
                
                ${present.notes ? `
                    <div class="present-notes">
                        <strong>Observações:</strong>
                        ${present.notes}
                    </div>
                ` : ''}
                
                <div class="present-actions">
                    ${!present.isGiven ? `
                        <button class="btn-small btn-success" onclick="app.markAsGiven('${present.id}')">
                            <i class="fas fa-gift"></i> Marcar como Dado
                        </button>
                    ` : `
                        <button class="btn-small btn-warning" onclick="app.unmarkPresent('${present.id}')">
                            <i class="fas fa-undo"></i> Desmarcar
                        </button>
                    `}
                    <button class="btn-small btn-danger" onclick="app.removePresent('${present.id}')">
                        <i class="fas fa-trash"></i> Remover
                    </button>
                </div>
            </div>
        `;
    }

    // Estatísticas
    updateStatistics() {
        // Atualiza contador no cabeçalho se existir
        const total = this.presents.length;
        const given = this.presents.filter(p => p.isGiven).length;
        const pending = total - given;
        
        // Pode adicionar badges de contagem nos filtros
        document.querySelectorAll('.filter-btn').forEach(btn => {
            const filter = btn.onclick.toString().match(/'(\w+)'/)[1];
            let count = total;
            if (filter === 'pending') count = pending;
            if (filter === 'given') count = given;
            
            // Remove badge existente
            const existingBadge = btn.querySelector('.badge');
            if (existingBadge) existingBadge.remove();
            
            // Adiciona novo badge
            if (count > 0) {
                const badge = document.createElement('span');
                badge.className = 'badge';
                badge.textContent = count;
                badge.style.cssText = `
                    background: #fff;
                    color: #e91e63;
                    padding: 2px 6px;
                    border-radius: 10px;
                    font-size: 0.7rem;
                    margin-left: 5px;
                    font-weight: bold;
                `;
                btn.appendChild(badge);
            }
        });
    }

    // Mostrar estatísticas detalhadas
    showStatistics() {
        const total = this.presents.length;
        const given = this.presents.filter(p => p.isGiven).length;
        const pending = total - given;
        const progress = total > 0 ? ((given / total) * 100).toFixed(1) : 0;
        
        const totalValue = this.presents.reduce((sum, p) => sum + p.price, 0);
        const spentValue = this.presents.filter(p => p.isGiven).reduce((sum, p) => sum + p.price, 0);
        const remainingValue = totalValue - spentValue;
        
        // Contar categorias
        const categories = {};
        this.presents.forEach(p => {
            categories[p.category] = (categories[p.category] || 0) + 1;
        });
        
        const categoriesHtml = Object.entries(categories)
            .sort((a, b) => b[1] - a[1])
            .map(([cat, count]) => `
                <div class="category-item">
                    <span>${cat}</span>
                    <span>${count} item(s)</span>
                </div>
            `).join('');

        const content = `
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-number">${total}</div>
                    <div class="stat-label">Total de Presentes</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${given}</div>
                    <div class="stat-label">Presentes Dados</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${pending}</div>
                    <div class="stat-label">Presentes Pendentes</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${progress}%</div>
                    <div class="stat-label">Progresso</div>
                </div>
            </div>
            
            ${totalValue > 0 ? `
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-number">R$ ${totalValue.toFixed(2)}</div>
                        <div class="stat-label">Valor Total</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">R$ ${spentValue.toFixed(2)}</div>
                        <div class="stat-label">Valor Gasto</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">R$ ${remainingValue.toFixed(2)}</div>
                        <div class="stat-label">Valor Restante</div>
                    </div>
                </div>
            ` : ''}
            
            ${Object.keys(categories).length > 0 ? `
                <div class="categories-list">
                    <h3>Categorias Populares</h3>
                    ${categoriesHtml}
                </div>
            ` : ''}
        `;
        
        document.getElementById('statisticsContent').innerHTML = content;
        document.getElementById('statisticsModal').style.display = 'block';
    }

    // Notificações
    showNotification(message, type = 'info') {
        // Criar notificação toast
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 10px;
            color: white;
            font-weight: 600;
            z-index: 2000;
            animation: slideInRight 0.3s ease;
            box-shadow: 0 4px 16px rgba(0,0,0,0.2);
        `;
        
        // Cores baseadas no tipo
        const colors = {
            success: '#4caf50',
            warning: '#ff9800',
            error: '#f44336',
            info: '#2196f3'
        };
        
        notification.style.background = colors[type] || colors.info;
        
        document.body.appendChild(notification);
        
        // Remover após 3 segundos
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // Métodos para modais
    showAddForm() {
        document.getElementById('addForm').style.display = 'block';
        document.getElementById('presentName').focus();
    }

    hideAddForm() {
        document.getElementById('addForm').style.display = 'none';
        document.getElementById('presentForm').reset();
    }

    hideStatistics() {
        document.getElementById('statisticsModal').style.display = 'none';
    }
}

// Funções globais para os botões
function showAddForm() {
    app.showAddForm();
}

function hideAddForm() {
    app.hideAddForm();
}

function showStatistics() {
    app.showStatistics();
}

function hideStatistics() {
    app.hideStatistics();
}

function filterPresents(filter) {
    app.filterPresents(filter);
}

// Adicionar estilos para animações
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes slideOutRight {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100px);
        }
    }
`;
document.head.appendChild(style);

// Inicializar aplicação
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new WishlistApp();
});