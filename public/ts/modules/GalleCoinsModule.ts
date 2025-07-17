/**
 * Módulo de GalleCoins - Maneja el sistema de monedas virtuales
 * Extiende BaseModule para funcionalidades comunes
 */

import BaseModule from './BaseModule';

interface Transaction {
  fecha: Date;
  tipo: 'compra' | 'gasto' | 'recompensa';
  descripcion: string;
  cantidad: string;
  balance: number;
}

interface Stats {
  balance: number;
  totalCompras: number;
  totalGastos: number;
  transacciones: number;
}

type ViewType = 'balance' | 'comprar' | 'historial';

class GalleCoinsModule extends BaseModule {
  private currentView: ViewType = 'balance';
  private balance: number = 1250;
  private historial: Transaction[] = [];

  protected onInit(): void {
    this.loadHistorial();
    this.showView('balance');
  }

  protected onDOMReady(): void {
    this.setupGalleCoinsEventListeners();
  }

  /**
   * Configurar event listeners específicos de GalleCoins
   */
  private setupGalleCoinsEventListeners(): void {
    // Navegación entre vistas
    this.addEventListener('#btn-balance', 'click', () => {
      this.showView('balance');
    });

    this.addEventListener('#btn-comprar', 'click', () => {
      this.showView('comprar');
    });

    this.addEventListener('#btn-historial', 'click', () => {
      this.showView('historial');
    });

    // Botones de acción rápida
    this.addEventListener('#btn-comprar-rapido', 'click', () => {
      this.showView('comprar');
    });

    this.addEventListener('#btn-ver-mangas', 'click', () => {
      window.location.href = '/';
    });

    // Botones de compra de paquetes
    this.setupPurchaseButtons();
  }

  /**
   * Configurar botones de compra
   */
  private setupPurchaseButtons(): void {
    const purchaseButtons = document.querySelectorAll('#comprar-view button');
    purchaseButtons.forEach(button => {
      if (button.textContent?.includes('Comprar')) {
        this.addEventListener(`#${button.id}`, 'click', (e: Event) => {
          const target = e.target as HTMLElement;
          const packageCard = target.closest('.bg-white');
          if (packageCard) {
            const coinsText = packageCard.querySelector('h3')?.textContent || '';
            const priceText = packageCard.querySelector('.text-3xl')?.textContent || '';
            
            this.handlePurchase(coinsText, priceText);
          }
        });
      }
    });
  }

  /**
   * Mostrar vista específica
   */
  private showView(view: ViewType): void {
    this.currentView = view;
    
    // Ocultar todas las vistas
    this.toggleElement('#balance-view', false);
    this.toggleElement('#comprar-view', false);
    this.toggleElement('#historial-view', false);
    
    // Mostrar la vista seleccionada
    if (view === 'balance') {
      this.toggleElement('#balance-view', true);
      this.updateNavButtons('balance');
    } else if (view === 'comprar') {
      this.toggleElement('#comprar-view', true);
      this.updateNavButtons('comprar');
    } else if (view === 'historial') {
      this.toggleElement('#historial-view', true);
      this.updateNavButtons('historial');
      this.renderHistorial();
    }
  }

  /**
   * Actualizar botones de navegación
   */
  private updateNavButtons(activeView: ViewType): void {
    this.toggleClass('.nav-link-gc', 'bg-yellow-600', false);
    
    if (activeView === 'balance') {
      this.toggleClass('#btn-balance', 'bg-yellow-600', true);
    } else if (activeView === 'comprar') {
      this.toggleClass('#btn-comprar', 'bg-yellow-600', true);
    } else if (activeView === 'historial') {
      this.toggleClass('#btn-historial', 'bg-yellow-600', true);
    }
  }

  /**
   * Manejar compra de coins
   */
  private async handlePurchase(coinsText: string, priceText: string): Promise<void> {
    const coins = parseInt(coinsText.split(' ')[0].replace(',', ''));
    const price = priceText;
    
    try {
      this.showLoading('#comprar-view button');
      
      // Simular proceso de pago
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Actualizar balance
      this.balance += coins;
      this.updateBalance();
      
      // Agregar al historial
      this.addToHistorial({
        fecha: new Date(),
        tipo: 'compra',
        descripcion: `Compra de ${coinsText}`,
        cantidad: `+${coins}`,
        balance: this.balance
      });
      
      this.showNotification(`¡Compra exitosa! Se agregaron ${coins} GalleCoins a tu cuenta`, 'success');
      
      // Volver a la vista de balance
      setTimeout(() => {
        this.showView('balance');
      }, 1500);
      
    } catch (error) {
      this.showNotification('Error al procesar la compra', 'error');
    } finally {
      this.hideLoading('#comprar-view button');
    }
  }

  /**
   * Actualizar balance en la UI
   */
  private updateBalance(): void {
    const balanceElement = document.getElementById('balance-amount');
    if (balanceElement) {
      balanceElement.textContent = this.balance.toLocaleString();
    }
  }

  /**
   * Cargar historial (simulado)
   */
  private loadHistorial(): void {
    // Simular datos de historial
    this.historial = [
      {
        fecha: new Date('2024-01-15'),
        tipo: 'compra',
        descripcion: 'Compra de 500 Coins',
        cantidad: '+500',
        balance: 1750
      },
      {
        fecha: new Date('2024-01-14'),
        tipo: 'gasto',
        descripcion: 'Jujutsu Kaisen - Capítulo 5',
        cantidad: '-50',
        balance: 1250
      },
      {
        fecha: new Date('2024-01-13'),
        tipo: 'gasto',
        descripcion: 'Banana Fish - Capítulo 3',
        cantidad: '-30',
        balance: 1300
      },
      {
        fecha: new Date('2024-01-12'),
        tipo: 'recompensa',
        descripcion: 'Login diario',
        cantidad: '+10',
        balance: 1330
      },
      {
        fecha: new Date('2024-01-11'),
        tipo: 'compra',
        descripcion: 'Compra de 1,000 Coins',
        cantidad: '+1000',
        balance: 1320
      }
    ];
  }

  /**
   * Agregar transacción al historial
   */
  private addToHistorial(transaction: Transaction): void {
    this.historial.unshift(transaction);
  }

  /**
   * Renderizar historial
   */
  private renderHistorial(): void {
    const tbody = document.getElementById('historial-table-body');
    if (!tbody) return;

    tbody.innerHTML = '';

    this.historial.forEach(transaction => {
      const row = document.createElement('tr');
      row.className = 'hover:bg-gray-50';
      
      const tipoClass = transaction.tipo === 'compra' ? 'text-green-600' : 
                       transaction.tipo === 'gasto' ? 'text-red-600' : 'text-blue-600';
      
      const tipoIcon = transaction.tipo === 'compra' ? 'fas fa-plus-circle' :
                      transaction.tipo === 'gasto' ? 'fas fa-minus-circle' : 'fas fa-gift';
      
      row.innerHTML = `
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          ${transaction.fecha.toLocaleDateString('es-ES')}
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
          <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${tipoClass}">
            <i class="${tipoIcon} mr-1"></i>${this.getTipoLabel(transaction.tipo)}
          </span>
        </td>
        <td class="px-6 py-4 text-sm text-gray-900">
          ${transaction.descripcion}
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium ${tipoClass}">
          ${transaction.cantidad}
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          ${transaction.balance.toLocaleString()}
        </td>
      `;
      
      tbody.appendChild(row);
    });
  }

  /**
   * Obtener etiqueta de tipo de transacción
   */
  private getTipoLabel(tipo: Transaction['tipo']): string {
    const labels: Record<string, string> = {
      'compra': 'Compra',
      'gasto': 'Gasto',
      'recompensa': 'Recompensa'
    };
    return labels[tipo] || tipo;
  }

  /**
   * Obtener balance actual
   */
  public getBalance(): number {
    return this.balance;
  }

  /**
   * Gastar coins
   */
  public spendCoins(amount: number, description: string): boolean {
    if (this.balance >= amount) {
      this.balance -= amount;
      this.updateBalance();
      
      this.addToHistorial({
        fecha: new Date(),
        tipo: 'gasto',
        descripcion: description,
        cantidad: `-${amount}`,
        balance: this.balance
      });
      
      return true;
    } else {
      this.showNotification('No tienes suficientes GalleCoins', 'error');
      return false;
    }
  }

  /**
   * Agregar coins (recompensas, etc.)
   */
  public addCoins(amount: number, description: string): void {
    this.balance += amount;
    this.updateBalance();
    
    this.addToHistorial({
      fecha: new Date(),
      tipo: 'recompensa',
      descripcion: description,
      cantidad: `+${amount}`,
      balance: this.balance
    });
    
    this.showNotification(`Se agregaron ${amount} GalleCoins a tu cuenta`, 'success');
  }

  /**
   * Verificar si tiene suficientes coins
   */
  public hasEnoughCoins(amount: number): boolean {
    return this.balance >= amount;
  }

  /**
   * Obtener estadísticas
   */
  public getStats(): Stats {
    const compras = this.historial.filter(t => t.tipo === 'compra');
    const gastos = this.historial.filter(t => t.tipo === 'gasto');
    
    const totalCompras = compras.reduce((sum, t) => sum + parseInt(t.cantidad.replace('+', '')), 0);
    const totalGastos = gastos.reduce((sum, t) => sum + parseInt(t.cantidad.replace('-', '')), 0);
    
    return {
      balance: this.balance,
      totalCompras,
      totalGastos,
      transacciones: this.historial.length
    };
  }
}

// Exportar para uso en otros módulos
export default GalleCoinsModule; 