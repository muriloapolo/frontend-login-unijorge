<template>
  <div class="confirmados-container">
    <h1 class="page-title">Agendamentos Confirmados</h1>

    <div class="busca-container">
      <input 
        type="text" 
        v-model="cpfBusca" 
        placeholder="Filtrar por CPF..." 
        class="cpf-search-input"
      >
    </div>

    <div v-if="isLoading" class="loading-message">
        Carregando agendamentos confirmados...
    </div>

    <div v-if="!isLoading" class="agendamentos-list">
      <div v-if="agendamentosFiltrados.length === 0" class="no-agendamentos">
        Nenhum agendamento confirmado encontrado para este CPF.
      </div>
      <div 
        v-for="ag in agendamentosFiltrados" 
        :key="ag._id" 
        class="agendamento-card"
        :class="{ 'agendamento-confirmado': ag.status === 'Confirmado' }"
      >
        <p><strong>Paciente:</strong> {{ ag.pacienteId ? ag.pacienteId.nome : 'Não informado' }}</p>
        <p><strong>CPF:</strong> {{ ag.pacienteId ? ag.pacienteId.cpf : 'Não informado' }}</p>
        <p><strong>Médico:</strong> {{ ag.medicoId ? ag.medicoId.nome : 'Não informado' }}</p>
        <p><strong>Data:</strong> {{ formatarDataCard(ag.data) }}</p>
        <p><strong>Horário:</strong> {{ ag.horario }}</p>
        <p class="status-text confirmado">Status: Confirmado</p>
        <div class="agendamento-actions">
            <button @click="openModal('cancelar', ag)" class="action-btn cancel-btn">Cancelar</button>
        </div>
      </div>
    </div>

    <div v-if="showModal" class="modal-overlay">
        <div class="modal-content">
            <h3>{{ modalTitle }}</h3>
            <p>{{ modalMessage }}</p>
            <div class="modal-actions">
                <button @click="confirmAction" class="action-btn">{{ modalConfirmText }}</button>
                <button @click="closeModal" class="action-btn cancel-btn">Voltar</button>
            </div>
        </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: "AgendamentosConfirmados",
  data() {
    return {
      agendamentos: [],
      isLoading: false,
      cpfBusca: '',
      showModal: false,
      modalTitle: '',
      modalMessage: '',
      modalConfirmText: '',
      actionToPerform: null,
      itemToProcess: null,
    };
  },
  computed: {
    agendamentosFiltrados() {
      if (!this.cpfBusca) {
        return this.agendamentos;
      }

      const cpfLimpo = this.cpfBusca.replace(/\D/g, '');
      return this.agendamentos.filter(ag => ag.pacienteId && ag.pacienteId.cpf && ag.pacienteId.cpf.includes(cpfLimpo));
    },
  },
  mounted() {
    this.carregarAgendamentosConfirmados();
  },
  methods: {
    // Método para obter o token JWT. Ajuste conforme sua lógica de autenticação.
    getToken() {
      // Supondo que você tenha o token JWT armazenado em localStorage.
      // Você pode adaptar para Vuex, Pinia ou outra solução de estado.
      return localStorage.getItem('token');
    },

    async carregarAgendamentosConfirmados() {
        this.isLoading = true;
        try {
            const token = this.getToken();
            const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/agendamentos/confirmados`, {
                headers: {
                    Authorization: `Bearer ${token}` // Incluindo o token no cabeçalho
                }
            });
            this.agendamentos = response.data;
        } catch (error) {
            console.error("Erro ao carregar agendamentos confirmados:", error);
            // Mensagem de erro no modal
            this.openModal('error', { 
                title: 'Erro de Carregamento', 
                message: 'Ocorreu um erro ao carregar os agendamentos. Por favor, tente novamente.' 
            });
        } finally {
            this.isLoading = false;
        }
    },
    formatarDataCard(dateString) {
      if (!dateString) return 'Não informado';
      const [year, month, day] = dateString.split('-');
      return `${day}/${month}/${year}`;
    },
    openModal(action, item) {
        this.actionToPerform = action;
        this.itemToProcess = item;

        if (action === 'cancelar') {
            this.modalTitle = 'Cancelar Agendamento';
            this.modalMessage = `Tem certeza que deseja cancelar o agendamento de ${item.pacienteId.nome} para ${this.formatarDataCard(item.data)} às ${item.horario}?`;
            this.modalConfirmText = 'Sim, Cancelar';
        } else if (action === 'error') {
            this.modalTitle = item.title;
            this.modalMessage = item.message;
            this.modalConfirmText = 'Fechar';
            this.actionToPerform = null; // Não há ação a ser confirmada
        } else if (action === 'success') {
            this.modalTitle = item.title;
            this.modalMessage = item.message;
            this.modalConfirmText = 'OK';
            this.actionToPerform = null; // Não há ação a ser confirmada
        }

        this.showModal = true;
    },
    closeModal() {
        this.showModal = false;
        this.actionToPerform = null;
        this.itemToProcess = null;
    },
    async confirmAction() {
        if (this.actionToPerform === 'cancelar') {
            await this.cancelarAgendamento(this.itemToProcess);
        }
        this.closeModal();
    },
    async cancelarAgendamento(agendamento) {
        try {
            const token = this.getToken();
            await axios.put(`${import.meta.env.VITE_API_BASE_URL}/api/agendamentos/${agendamento._id}`, 
              { status: 'Cancelado' },
              {
                headers: {
                    Authorization: `Bearer ${token}` // Incluindo o token no cabeçalho
                }
              }
            );
            this.openModal('success', { title: 'Sucesso!', message: 'Agendamento cancelado com sucesso!' });
            this.carregarAgendamentosConfirmados(); // Recarrega a lista
        } catch (error) {
            console.error("Erro ao cancelar agendamento:", error);
            this.openModal('error', { title: 'Erro', message: 'Erro ao cancelar agendamento. Tente novamente.' });
        }
    }
  }
};
</script>

<style scoped>
.confirmados-container {
  padding: 40px;
}
.page-title {
  font-size: 2em;
  margin-bottom: 20px;
  color: #222;
}
.busca-container {
    max-width: 600px;
    margin: 0 auto 20px;
    text-align: center;
}
.cpf-search-input {
    padding: 10px;
    width: 100%;
    border: 1px solid #ccc;
    border-radius: 6px;
    font-size: 1em;
}
.agendamentos-list {
  max-width: 600px;
  margin: 0 auto;
}
.agendamento-card {
  background-color: #ffffff;
  border: 1px solid #eee;
  border-left: 5px solid #3498db;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}
.agendamento-card.agendamento-confirmado {
  border-left: 8px solid #2ecc71;
}
.agendamento-card p {
  margin: 5px 0;
}
.no-agendamentos {
  text-align: center;
  color: #888;
  font-style: italic;
  margin-top: 30px;
}
.status-text {
    font-weight: bold;
    font-size: 0.9em;
    padding: 2px 8px;
    border-radius: 4px;
    display: inline-block;
    margin-top: 10px;
}
.status-text.confirmado {
    background-color: #2ecc71;
    color: white;
}
.agendamento-actions {
    margin-top: 15px;
    display: flex;
    justify-content: flex-end;
    gap: 10px;
}
.action-btn {
    padding: 8px 12px;
    border: none;
    border-radius: 6px;
    color: white;
    font-weight: bold;
    cursor: pointer;
    transition: background-color 0.2s;
}
.cancel-btn {
    background-color: #e74c3c;
}
.cancel-btn:hover {
    background-color: #c0392b;
}

.loading-message {
    text-align: center;
    color: #555;
    font-style: italic;
    margin-top: 30px;
}

.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.modal-content {
    background-color: white;
    padding: 30px;
    border-radius: 10px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    text-align: center;
    max-width: 400px;
    width: 90%;
}

.modal-content h3 {
    margin-top: 0;
    font-size: 1.5em;
    color: #333;
}

.modal-content p {
    margin: 20px 0;
    color: #666;
}

.modal-actions {
    display: flex;
    justify-content: space-around;
    gap: 15px;
}
</style>
