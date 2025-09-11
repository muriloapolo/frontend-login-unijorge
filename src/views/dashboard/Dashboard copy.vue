<template>
  <div class="dashboard-container">
    <aside class="sidebar" :class="{ 'open': isMenuOpen }">
      <div class="sidebar-header">
         <button class="close-btn " @click="closeMenu">×</button>
        <h2 class="sidebar-title">Painel de Controle</h2>
       
      </div>
      <nav class="sidebar-nav">
        <router-link to="/dashboard/agendamentos" class="nav-item" @click="closeMenu">
          <span>Agendar Atendimentos</span>
        </router-link>
        <router-link to="/dashboard/usuarios" class="nav-item" @click="closeMenu">
          <span>Cadastrar Usuários</span>
        </router-link>
        <router-link to="/dashboard/todos-agendamentos" class="nav-item" @click="closeMenu">
          <span>Ver Agendamentos Pendentes</span>
        </router-link>
        <router-link to="/dashboard/dados-pacientes" class="nav-item" @click="closeMenu">
          <span>Ver Agendamentos Confirmados</span>
        </router-link>
        <a href="#" @click.prevent="logoutAndClose" class="nav-item logout-item">
          <span>Sair</span>
        </a>
      </nav>
    </aside>

    <main class="main-content">
      <div class="top-bar">
        <button class="hamburger-btn" @click="toggleMenu">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
      <router-view 
        :agendamentos-nao-confirmados="agendamentosNaoConfirmados"
        :agendamentos-confirmados="agendamentosConfirmados"
        @agendamento-criado="adicionarAgendamento"
        @agendamento-cancelado="cancelarAgendamento"
        @agendamento-confirmado="confirmarAgendamento"
        @agendamento-confirmado-cancelado="cancelarAgendamentoConfirmado"
      ></router-view>
    </main>
    
    <div class="backdrop" v-if="isMenuOpen" @click="closeMenu"></div>
  </div>
</template>

<script>
import { auth } from '../../router'; 

export default {
  name: 'Dashboard',
  data() {
    const today = new Date();
    const formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const formattedYesterday = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
    
    return {
      isMenuOpen: false, 
      agendamentosNaoConfirmados: [
        { id: 1, paciente: 'Pedro Henrique', cpf: '12345678900', medico: 'Dr. João Silva', data: formattedDate, horario: '09:00', duracao: 60, status: 'pendente' },
        { id: 2, paciente: 'Fernanda Lima', cpf: '09876543211', medico: 'Dr. João Silva', data: formattedDate, horario: '11:00', duracao: 20, status: 'pendente' },
        { id: 3, paciente: 'Ana Souza', medico: 'Dra. Maria Oliveira', data: formattedDate, horario: '14:30', duracao: 20, status: 'pendente' },
        { id: 4, paciente: 'Carlos Pinto', medico: 'Dra. Maria Oliveira', data: '2025-09-09', horario: '10:00', duracao: 20, status: 'pendente' },
        { id: 5, paciente: 'Juliana Costa', medico: 'Dr. Pedro Martins', data: '2025-09-10', horario: '15:40', duracao: 20, status: 'pendente' },
        { id: 6, paciente: 'Rodrigo Alves', medico: 'Dr. João Silva', data: formattedYesterday, horario: '10:00', duracao: 30, status: 'pendente' }
      ],
      agendamentosConfirmados: []
    };
  },
  methods: {
    toggleMenu() {
      this.isMenuOpen = !this.isMenuOpen;
    },
    closeMenu() {
      this.isMenuOpen = false;
    },
    logoutAndClose() {
      this.closeMenu();
      this.logout();
    },
    logout() {
      auth.isAuthenticated = false;
      localStorage.removeItem('isAuthenticated');
      this.$router.push('/');
      console.log('Usuário deslogado com sucesso.');
    },
    adicionarAgendamento(novoAgendamento) {
      this.agendamentosNaoConfirmados.push(novoAgendamento);
      console.log('Lista de agendamentos pendentes atualizada:', this.agendamentosNaoConfirmados);
    },
    cancelarAgendamento(agendamento) {
      this.agendamentosNaoConfirmados = this.agendamentosNaoConfirmados.filter(ag => ag.id !== agendamento.id);
      console.log('Agendamento cancelado e removido da lista de pendentes.');
    },
    confirmarAgendamento(agendamento) {
      const agendamentoParaMover = this.agendamentosNaoConfirmados.find(ag => ag.id === agendamento.id);
      if (agendamentoParaMover) {
        agendamentoParaMover.status = 'confirmado';
        this.agendamentosConfirmados.push(agendamentoParaMover);
        this.agendamentosNaoConfirmados = this.agendamentosNaoConfirmados.filter(ag => ag.id !== agendamento.id);
        console.log('Agendamento confirmado e movido para a lista de confirmados.');
      }
    },
    cancelarAgendamentoConfirmado(agendamento) {
      this.agendamentosConfirmados = this.agendamentosConfirmados.filter(ag => ag.id !== agendamento.id);
      console.log('Agendamento confirmado cancelado e removido do banco de dados.');
    }
  }
};
</script>

<style scoped>
.dashboard-container {
  display: flex;
  min-height: 100vh;
}
.sidebar {
  width: 280px;
  background-color: #2c3e50;
  color: #ecf0f1;
  padding: 20px;
  display: flex;
  flex-direction: column;
  transition: transform 0.3s ease-in-out;
  flex-shrink: 0; 
}
.sidebar-header {
  margin-bottom: 30px;
  text-align: center;
  position: relative; /* Mantém a posição relativa para o botão absoluto */
}
.sidebar-title {
  font-size: 1.5em;
  font-weight: bold;
}
.sidebar-nav {
  display: flex;
  flex-direction: column;
}
.nav-item {
  color: #ecf0f1;
  text-decoration: none;
  padding: 15px 20px;
  margin: 5px 0;
  border-radius: 8px;
  transition: background-color 0.3s, transform 0.2s;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 15px;
}
.nav-item span::before {
  content: "»"; 
  font-size: 1.2em;
  font-weight: bold;
}
.nav-item:hover {
  background-color: #34495e;
  transform: translateX(5px);
}
.nav-item.router-link-exact-active {
  background-color: #3498db;
  font-weight: bold;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}
.logout-item {
  margin-top: auto;
  border-top: 1px solid #34495e;
  padding-top: 20px;
}
.main-content {
  flex-grow: 1;
  background-color: #f4f7f9;
  padding: 20px;
  position: relative;
}

/* Estilos para Mobile */
.top-bar {
  display: none; /* Esconde em telas grandes */
}
.backdrop {
  display: none; /* Esconde a camada de fundo por padrão */
}
.close-btn{
  display: none;
}
@media (max-width: 768px) {
  .dashboard-container {
    position: relative;
  }
  .top-bar {
    display: block; /* Mostra a barra superior em mobile */
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 60px;
    background-color: #fff;
    padding: 10px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    z-index: 999;
  }

  .sidebar {
    position: fixed;
    z-index: 1000;
    top: 0;
    left: 0;
    height: 100%;
    transform: translateX(-100%);
  }

  .sidebar.open {
    transform: translateX(0);
    box-shadow: 5px 0 15px rgba(0, 0, 0, 0.3);
  }
  
  .main-content {
    padding-top: 80px; /* Adiciona espaço para a top-bar */
  }

  .hamburger-btn {
    display: block; 
    background: none;
    border: none;
    cursor: pointer;
    padding: 10px;
    border-radius: 5px;
  }
  .hamburger-btn span {
    display: block;
    width: 25px;
    height: 3px;
    background-color: #333;
    margin: 5px 0;
    transition: all 0.3s ease-in-out;
  }


  .close-btn {
    display: block; 
    background: transparent; /* Fundo transparente */
    border: none; /* Remove a borda */
    color: #ecf0f1;
    font-size: 2em;
    cursor: pointer;
    line-height: 1;
    position: absolute; /* Posição absoluta */
    top: -15px; /* Alinhado ao topo */
    right: -10px; /* Alinhado à direita */
    z-index: 1001; /* Garante que fique acima de outros elementos */
  }
  
  .backdrop {
    display: block;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 999;
    transition: opacity 0.3s ease-in-out;
  }
}
</style>