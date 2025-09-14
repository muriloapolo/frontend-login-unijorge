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
import axios from 'axios';

export default {
  name: 'Dashboard',
  data() {
    return {
      isMenuOpen: false, 
      agendamentosNaoConfirmados: [],
      agendamentosConfirmados: []
    };
  },
  created() {
    this.fetchAgendamentos();
  },
  methods: {
    async fetchAgendamentos() {
      const apiBaseUrl = 'https://backend-fullstack-ebon.vercel.app';
      const token = localStorage.getItem('authToken');

      if (!token) {
        console.error("Token de autenticação não encontrado.");
        this.$router.push('/');
        return;
      }

      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };

      try {
        const [pendingResponse, confirmedResponse] = await Promise.all([
          axios.get(`${apiBaseUrl}/api/agendamentos/pendentes`, config),
          axios.get(`${apiBaseUrl}/api/agendamentos/confirmados`, config)
        ]);

        this.agendamentosNaoConfirmados = pendingResponse.data;
        this.agendamentosConfirmados = confirmedResponse.data;

        console.log("Dados carregados do backend com sucesso.");
      } catch (error) {
        console.error('Erro ao buscar agendamentos:', error);
        // Em caso de erro, redireciona para o login
        this.$router.push('/');
      }
    },
    async adicionarAgendamento(novoAgendamento) {
      const apiBaseUrl = 'https://backend-fullstack-ebon.vercel.app';
      const token = localStorage.getItem('authToken');

      try {
        const response = await axios.post(`${apiBaseUrl}/api/agendamentos`, novoAgendamento, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        // Adiciona o agendamento retornado pelo backend
        this.agendamentosNaoConfirmados.push(response.data);
        console.log('Agendamento criado e salvo no banco de dados:', response.data);
      } catch (error) {
        console.error('Erro ao adicionar agendamento:', error);
      }
    },
    async cancelarAgendamento(agendamento) {
      const apiBaseUrl = 'https://backend-fullstack-ebon.vercel.app';
      const token = localStorage.getItem('authToken');

      try {
        await axios.delete(`${apiBaseUrl}/api/agendamentos/${agendamento.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        this.agendamentosNaoConfirmados = this.agendamentosNaoConfirmados.filter(ag => ag.id !== agendamento.id);
        console.log('Agendamento cancelado e removido do banco de dados.');
      } catch (error) {
        console.error('Erro ao cancelar agendamento:', error);
      }
    },
    async confirmarAgendamento(agendamento) {
      const apiBaseUrl = 'https://backend-fullstack-ebon.vercel.app';
      const token = localStorage.getItem('authToken');

      try {
        await axios.put(`${apiBaseUrl}/api/agendamentos/confirmar/${agendamento.id}`, {}, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        // Move o agendamento na interface
        const agendamentoParaMover = this.agendamentosNaoConfirmados.find(ag => ag.id === agendamento.id);
        if (agendamentoParaMover) {
          agendamentoParaMover.status = 'confirmado';
          this.agendamentosConfirmados.push(agendamentoParaMover);
          this.agendamentosNaoConfirmados = this.agendamentosNaoConfirmados.filter(ag => ag.id !== agendamento.id);
          console.log('Agendamento confirmado e movido no banco de dados.');
        }
      } catch (error) {
        console.error('Erro ao confirmar agendamento:', error);
      }
    },
    async cancelarAgendamentoConfirmado(agendamento) {
      const apiBaseUrl = 'https://backend-fullstack-ebon.vercel.app';
      const token = localStorage.getItem('authToken');

      try {
        await axios.delete(`${apiBaseUrl}/api/agendamentos/${agendamento.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        this.agendamentosConfirmados = this.agendamentosConfirmados.filter(ag => ag.id !== agendamento.id);
        console.log('Agendamento confirmado cancelado e removido do banco de dados.');
      } catch (error) {
        console.error('Erro ao cancelar agendamento confirmado:', error);
      }
    },
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
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      this.$router.push('/');
      console.log('Usuário deslogado com sucesso.');
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
  position: relative; 
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
.top-bar {
  display: none;
}
.backdrop {
  display: none; 
}
.close-btn{
  display: none;
}
@media (max-width: 768px) {
  .dashboard-container {
    position: relative;
  }
  .top-bar {
    display: block; 
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
    padding-top: 80px; 
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
    background: transparent; 
    border: none; 
    color: #ecf0f1;
    font-size: 2em;
    cursor: pointer;
    line-height: 1;
    position: absolute; 
    top: -15px; 
    right: -10px; 
    z-index: 1001; 
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
