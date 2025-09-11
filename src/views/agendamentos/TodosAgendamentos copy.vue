<template>
  <div class="todos-agendamentos-container">
    <h1 class="page-title">Agendamentos Pendentes</h1>

    <div class="date-controls-container">
      <button @click="previousDay" class="nav-btn">&lt;</button>
      <div class="date-display-group">
        <span class="current-date-text" @click="toggleCalendar">
          {{ formattedDate }}
        </span>
      </div>
      <button @click="nextDay" class="nav-btn">&gt;</button>
    </div>

    <div v-if="showCalendar" class="calendar-dropdown">
      <div class="calendar-header">
        <button @click="previousMonth" class="calendar-nav">&lt;</button>
        <span>{{ calendarMonthYear }}</span>
        <button @click="nextMonth" class="calendar-nav">&gt;</button>
      </div>
      <div class="calendar-grid">
        <span v-for="day in calendarDaysOfWeek" :key="day" class="day-of-week">{{ day }}</span>
        <span
          v-for="blank in calendarBlanks"
          :key="'blank-' + blank"
          class="calendar-day blank"
        ></span>
        <span
          v-for="date in calendarDaysInMonth"
          :key="date"
          class="calendar-day"
          :class="{ 'current-day': isCurrentDay(date) }"
          @click="selectDate(date)"
        >
          {{ date }}
        </span>
      </div>
    </div>

    <div class="busca-container">
        <input 
            type="text" 
            v-model="cpfBusca" 
            placeholder="Filtrar por CPF..." 
            class="cpf-search-input"
        >
    </div>

    <div v-if="isLoading" class="loading-message">
        Carregando agendamentos...
    </div>

    <div v-if="!isLoading" class="agendamentos-list">
      <h2 class="list-title">
        Agendamentos para {{ formattedDate }}
      </h2>
      <div v-if="agendamentosFiltrados.length === 0" class="no-agendamentos">
        Nenhum agendamento pendente encontrado para este dia e/ou CPF.
      </div>
      <div v-for="ag in agendamentosFiltrados" :key="ag._id" class="agendamento-card">
        <p><strong>Paciente:</strong> {{ ag.pacienteId ? ag.pacienteId.nome : 'Não informado' }}</p>
        <p><strong>CPF:</strong> {{ ag.pacienteId ? ag.pacienteId.cpf : 'Não informado' }}</p>
        <p><strong>Médico:</strong> {{ ag.medicoId ? ag.medicoId.nome : 'Não informado' }}</p>
        <p><strong>Data:</strong> {{ formatarDataCard(ag.data) }}</p>
        <p><strong>Horário:</strong> {{ ag.horario }}</p>
        <!-- AQUI ESTÁ A MUDANÇA: Agora o status e a classe CSS são dinâmicos -->
        <p class="status-text" :class="getStatusClass(ag.status)">
            Status: {{ getStatusText(ag.status) }}
        </p>
        <div class="agendamento-actions">
            <button @click="openModal('cancelar', ag)" class="action-btn cancel-btn">Cancelar</button>
            <button @click="openModal('confirmar', ag)" class="action-btn confirm-btn">Confirmar</button>
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

    <div v-if="mensagem" :class="['alerta', { 'alerta-sucesso': sucesso, 'alerta-erro': !sucesso }]">
        {{ mensagem }}
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: "TodosAgendamentos",
  data() {
    return {
      agendamentos: [],
      isLoading: false,
      currentDate: new Date(),
      showCalendar: false,
      calendarDate: new Date(),
      cpfBusca: '',
      showModal: false,
      modalTitle: '',
      modalMessage: '',
      modalConfirmText: '',
      actionToPerform: null,
      itemToProcess: null,
      mensagem: '',
      sucesso: false,
    };
  },
  computed: {
    formattedDate() {
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      return this.currentDate.toLocaleDateString("pt-BR", options);
    },
    agendamentosFiltrados() {
      // CORREÇÃO: Filtra por agendamentos com status "pendente" (minúsculo) para corresponder ao servidor.
      // E garante que a propriedade existe antes de tentar convertê-la para minúscula.
      const agendamentosPendentes = this.agendamentos.filter(ag => ag.status && ag.status.toLowerCase() === 'pendente');
      
      if (!this.cpfBusca) {
          return agendamentosPendentes;
      }
      const cpfLimpo = this.cpfBusca.replace(/\D/g, '');
      return agendamentosPendentes.filter(ag => ag.pacienteId && ag.pacienteId.cpf && ag.pacienteId.cpf.includes(cpfLimpo));
    },
    calendarDaysOfWeek() {
      return ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    },
    calendarMonthYear() {
      const options = { month: 'long', year: 'numeric' };
      return this.calendarDate.toLocaleDateString("pt-BR", options);
    },
    calendarDaysInMonth() {
      const year = this.calendarDate.getFullYear();
      const month = this.calendarDate.getMonth();
      const lastDay = new Date(year, month + 1, 0).getDate();
      return Array.from({ length: lastDay }, (_, i) => i + 1);
    },
    calendarBlanks() {
      const year = this.calendarDate.getFullYear();
      const month = this.calendarDate.getMonth();
      const firstDay = new Date(year, month, 1).getDay();
      return firstDay;
    }
  },
  watch: {
    currentDate(newDate, oldDate) {
      this.carregarAgendamentosDoDia();
    }
  },
  mounted() {
    this.carregarAgendamentosDoDia();
  },
  methods: {
    async carregarAgendamentosDoDia() {
      this.isLoading = true;
      try {
        const formattedDate = this.formatDateForComparison(this.currentDate);
        // O endpoint agora busca todos os agendamentos, independentemente do status
        const response = await axios.get(`http://localhost:3000/api/agendamentos/data/${formattedDate}`);
        this.agendamentos = response.data;
      } catch (error) {
        if (error.response && error.response.status === 404) {
            this.agendamentos = []; // Limpa a lista se não houver agendamentos
        } else {
            console.error("Erro ao carregar agendamentos:", error);
            this.mostrarMensagem('Erro ao carregar agendamentos. Tente novamente.', false);
        }
      } finally {
        this.isLoading = false;
      }
    },
    formatDateForComparison(date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    },
    formatarDataCard(dateString) {
      const [year, month, day] = dateString.split('-');
      return `${day}/${month}/${year}`;
    },
    previousDay() {
      const newDate = new Date(this.currentDate);
      newDate.setDate(newDate.getDate() - 1);
      this.currentDate = newDate;
    },
    nextDay() {
      const newDate = new Date(this.currentDate);
      newDate.setDate(newDate.getDate() + 1);
      this.currentDate = newDate;
    },
    toggleCalendar() {
      this.showCalendar = !this.showCalendar;
      this.calendarDate = new Date(this.currentDate);
    },
    previousMonth() {
      this.calendarDate.setMonth(this.calendarDate.getMonth() - 1);
      this.calendarDate = new Date(this.calendarDate);
    },
    nextMonth() {
      this.calendarDate.setMonth(this.calendarDate.getMonth() + 1);
      this.calendarDate = new Date(this.calendarDate);
    },
    selectDate(day) {
      this.calendarDate.setDate(day);
      this.currentDate = new Date(this.calendarDate);
      this.showCalendar = false;
    },
    isCurrentDay(day) {
      return (
        day === this.currentDate.getDate() &&
        this.calendarDate.getMonth() === this.currentDate.getMonth() &&
        this.calendarDate.getFullYear() === this.currentDate.getFullYear()
      );
    },
    openModal(action, item) {
        this.actionToPerform = action;
        this.itemToProcess = item;
        if (action === 'cancelar') {
            this.modalTitle = 'Cancelar Agendamento';
            this.modalMessage = `Tem certeza que deseja cancelar o agendamento de ${item.pacienteId.nome} para ${this.formatarDataCard(item.data)} às ${item.horario}?`;
            this.modalConfirmText = 'Sim, Cancelar';
        } else if (action === 'confirmar') {
            this.modalTitle = 'Confirmar Agendamento';
            this.modalMessage = `Tem certeza que deseja confirmar o agendamento de ${item.pacienteId.nome} para ${this.formatarDataCard(item.data)} às ${item.horario}?`;
            this.modalConfirmText = 'Sim, Confirmar';
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
        } else if (this.actionToPerform === 'confirmar') {
            await this.confirmarAgendamento(this.itemToProcess);
        }
        this.closeModal();
    },
    async cancelarAgendamento(agendamento) {
        try {
            await axios.put(`http://localhost:3000/api/agendamentos/${agendamento._id}`, { status: 'Cancelado' });
            this.mostrarMensagem('Agendamento cancelado com sucesso!', true);
            this.carregarAgendamentosDoDia();
        } catch (error) {
            console.error("Erro ao cancelar agendamento:", error);
            this.mostrarMensagem('Erro ao cancelar agendamento. Tente novamente.', false);
        }
    },
    async confirmarAgendamento(agendamento) {
        try {
            await axios.put(`http://localhost:3000/api/agendamentos/${agendamento._id}`, { status: 'Confirmado' });
            this.mostrarMensagem('Agendamento confirmado com sucesso!', true);
            this.carregarAgendamentosDoDia();
        } catch (error) {
            console.error("Erro ao confirmar agendamento:", error);
            this.mostrarMensagem('Erro ao confirmar agendamento. Tente novamente.', false);
        }
    },
    mostrarMensagem(texto, sucesso) {
        this.mensagem = texto;
        this.sucesso = sucesso;
        setTimeout(() => {
            this.mensagem = '';
        }, 3000); // A mensagem some após 3 segundos
    },
    // CORREÇÃO: Utiliza o status em minúsculo para garantir a lógica
    getStatusText(status) {
        if (status && status.toLowerCase() === 'pendente') return 'Pendente';
        if (status && status.toLowerCase() === 'confirmado') return 'Confirmado';
        if (status && status.toLowerCase() === 'cancelado') return 'Cancelado';
        return status;
    },
    // CORREÇÃO: Utiliza o status em minúsculo para aplicar a classe CSS correta
    getStatusClass(status) {
        switch (status && status.toLowerCase()) {
            case 'pendente':
                return 'pendente';
            case 'confirmado':
                return 'confirmado';
            case 'cancelado':
                return 'cancelado';
            default:
                return '';
        }
    }
  },
};
</script>

<style scoped>
.todos-agendamentos-container {
  padding: 40px;
}
.page-title {
  font-size: 2em;
  margin-bottom: 20px;
  color: #222;
}
.date-controls-container {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 25px;
  gap: 15px;
}
.nav-btn {
  background-color: #f0f0f0;
  border: 1px solid #ddd;
  padding: 8px 15px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.2em;
  font-weight: bold;
  transition: background-color 0.2s;
}
.nav-btn:hover {
  background-color: #e0e0e0;
}
.current-date-text {
  font-size: 1.4em;
  font-weight: bold;
  color: #7b35e4;
  cursor: pointer;
  padding: 5px 10px;
  border-bottom: 2px solid transparent;
  transition: border-color 0.2s;
}
.current-date-text:hover {
  border-color: #7b35e4;
}
.calendar-dropdown {
  position: relative;
  max-width: 300px;
  margin: 0 auto 30px;
  background-color: white;
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  animation: fadeIn 0.3s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}
.calendar-header span {
  font-weight: bold;
}
.calendar-nav {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2em;
  color: #555;
}
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
}
.day-of-week {
  font-weight: bold;
  color: #777;
  padding: 5px;
}
.calendar-day {
  padding: 8px;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.2s;
}
.calendar-day:hover {
  background-color: #f0f0f0;
}
.calendar-day.current-day {
  background-color: #7b35e4;
  color: white;
  font-weight: bold;
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
.list-title {
  font-size: 1.5em;
  border-bottom: 2px solid #ddd;
  padding-bottom: 10px;
  margin-bottom: 20px;
}
.no-agendamentos {
  text-align: center;
  color: #888;
  font-style: italic;
  margin-top: 30px;
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
.agendamento-card p {
  margin: 5px 0;
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
.confirm-btn {
    background-color: #2ecc71;
}
.confirm-btn:hover {
    background-color: #27ae60;
}

.status-text {
    font-weight: bold;
    font-size: 0.9em;
    padding: 2px 8px;
    border-radius: 4px;
    display: inline-block;
    margin-top: 10px;
}
.status-text.pendente {
    background-color: #f39c12;
    color: white;
}
/* NOVA CLASSE: Para status "Confirmado" */
.status-text.confirmado {
    background-color: #2ecc71;
    color: white;
}
/* NOVA CLASSE: Para status "Cancelado" */
.status-text.cancelado {
    background-color: #e74c3c;
    color: white;
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
.alerta {
    position: fixed;
    bottom: 20px;
    right: 20px;
    padding: 15px;
    border-radius: 8px;
    font-weight: bold;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    animation: slideInFromRight 0.5s ease-out;
    z-index: 2000;
}
.alerta-sucesso {
    background-color: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
}
.alerta-erro {
    background-color: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
}
@keyframes slideInFromRight {
    from {
        transform: translateX(100%);
    }
    to {
        transform: translateX(0);
    }
}
</style>
