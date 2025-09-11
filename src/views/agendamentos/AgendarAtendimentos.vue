<template>
  <div class="agendar-atendimentos-container">
    <h1 class="page-title">Agendar Atendimentos</h1>
    
    <div class="busca-paciente-container">
      <div class="form-group-search">
        <label for="cpfBusca">Buscar Paciente por CPF</label>
        <div class="search-input-group">
          <input 
            type="text" 
            id="cpfBusca" 
            v-model="cpfBusca" 
            @keyup.enter="buscarPacientePorCpf" 
            placeholder="Ex: 123.456.789-00"
          >
          <button type="button" @click="buscarPacientePorCpf" class="search-btn" :disabled="isLoading">Pesquisar</button>
        </div>
        <p v-if="erroCpf" class="erro">{{ erroCpf }}</p>
      </div>
      
      <div v-if="pacienteEncontrado" class="paciente-info-card">
        <p class="paciente-info-title">Paciente Encontrado</p>
        <p><strong>Nome:</strong> {{ pacienteDados.nome }}</p>
        <p><strong>Telefone:</strong> {{ pacienteDados.telefone }}</p>
        <p><strong>Endereço:</strong> {{ pacienteDados.endereco }}</p>
      </div>

      <p v-if="pacienteNaoEncontrado" class="paciente-nao-encontrado">
        Paciente não encontrado.
        <br>
        <button @click="irParaCadastroPaciente" class="btn-link">Cadastrar Paciente</button>
      </p>
    </div>

    <form @submit.prevent="agendar" class="agendamento-form" v-if="pacienteEncontrado">
      <div class="form-group">
        <label for="nomePaciente">Nome do Paciente</label>
        <input type="text" id="nomePaciente" v-model="paciente" disabled required>
      </div>
      
      <div class="form-group">
        <label for="especialidade">Especialidade</label>
        <select id="especialidade" v-model="especialidadeSelecionada" @change="carregarMedicos" required>
          <option value="" disabled selected>Selecione uma especialidade</option>
          <option v-for="esp in especialidadesDisponiveis" :key="esp" :value="esp">{{ esp }}</option>
        </select>
      </div>

      <div class="form-group">
        <label for="medico">Médico</label>
        <select id="medico" v-model="medicoSelecionado" :disabled="!especialidadeSelecionada" required @change="carregarHorariosDisponiveis">
          <option value="" disabled selected>Selecione um médico</option>
          <option v-for="medico in medicosFiltrados" :key="medico._id" :value="medico">{{ medico.nome }}</option>
        </select>
      </div>

      <div class="form-group">
        <label for="data">Data</label>
        <input type="date" id="data" v-model="data" required :min="hoje" @change="carregarHorariosDisponiveis">
        <p v-if="erroData" class="erro">{{ erroData }}</p>
      </div>
      
      <div class="form-group">
        <label for="horario">Horário</label>
        <select id="horario" v-model="horarioSelecionado" :disabled="!medicoSelecionado || !data" required>
          <option value="" disabled selected>Selecione um horário</option>
          <option v-for="horario in horariosDisponiveis" :key="horario" :value="horario">{{ horario }}</option>
        </select>
        <p v-if="erroHorario" class="erro">{{ erroHorario }}</p>
      </div>
      
      <button type="submit" class="submit-btn" :disabled="isLoading">
        <span v-if="isLoading">Agendando...</span>
        <span v-else>Agendar</span>
      </button>
    </form>
    
    <div v-if="mensagem" :class="['alerta', { 'alerta-sucesso': sucesso, 'alerta-erro': !sucesso }]">
      {{ mensagem }}
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'AgendarAtendimentos',
  data() {
    const today = new Date();
    const formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const formattedToday = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    return {
      cpfBusca: '',
      paciente: '',
      pacienteEncontrado: false,
      pacienteNaoEncontrado: false,
      pacienteDados: {},
      erroCpf: '',
      erroData: '',
      erroHorario: '',
      
      especialidadeSelecionada: '',
      medicoSelecionado: null, // Alterado para armazenar o objeto completo do médico
      data: formattedDate,
      hoje: formattedToday,
      horarioSelecionado: '',
      
      especialidadesDisponiveis: [],
      medicosFiltrados: [],
      horariosDisponiveis: [],

      isLoading: false,
      mensagem: '',
      sucesso: false,
    };
  },
  mounted() {
    this.carregarEspecialidades();
  },
  methods: {
    async buscarPacientePorCpf() {
      this.isLoading = true;
      this.pacienteEncontrado = false;
      this.pacienteNaoEncontrado = false;
      this.paciente = '';
      this.pacienteDados = {};
      this.erroCpf = '';
      this.mensagem = '';

      const cpfLimpo = this.cpfBusca.replace(/\D/g, '');

      if (cpfLimpo.length === 0) {
        this.erroCpf = 'O campo de CPF não pode ficar vazio.';
        this.isLoading = false;
        return;
      }
      if (cpfLimpo.length !== 11) {
        this.erroCpf = 'CPF incompleto. Por favor, digite 11 dígitos.';
        this.isLoading = false;
        return;
      }
      
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/pacientes/cpf/${cpfLimpo}`);
        const paciente = response.data;
        if (paciente) {
          this.pacienteEncontrado = true;
          this.pacienteDados = paciente;
          this.paciente = paciente.nome;
        } else {
          this.pacienteNaoEncontrado = true;
        }
      } catch (error) {
        if (error.response && error.response.status === 404) {
          this.pacienteNaoEncontrado = true;
        } else {
          console.error('Erro ao buscar paciente:', error);
          this.erroCpf = 'Erro ao buscar paciente. Tente novamente.';
        }
      } finally {
        this.isLoading = false;
      }
    },
    irParaCadastroPaciente() {
      this.$router.push({
        name: 'CadastrarUsuarios',
        query: { tipo: 'paciente', cpf: this.cpfBusca }
      });
    },
    async carregarEspecialidades() {
      try {
        const response = await axios.get('http://localhost:3000/api/medicos/especialidades');
        this.especialidadesDisponiveis = response.data;
      } catch (error) {
        console.error('Erro ao carregar especialidades:', error);
        this.mensagem = 'Erro ao carregar especialidades.';
        this.sucesso = false;
      }
    },
    async carregarMedicos() {
      try {
        const response = await axios.get(`http://localhost:3000/api/medicos?especialidade=${this.especialidadeSelecionada}`);
        this.medicosFiltrados = response.data;
        this.medicoSelecionado = null;
        this.horarioSelecionado = '';
        this.horariosDisponiveis = [];
      } catch (error) {
        console.error('Erro ao carregar médicos:', error);
        this.mensagem = 'Erro ao carregar médicos.';
        this.sucesso = false;
      }
    },
    // CORRIGIDA: Agora busca e utiliza os horários disponíveis retornados pelo servidor
    async carregarHorariosDisponiveis() {
      this.erroData = '';
      this.erroHorario = '';
      
      if (!this.medicoSelecionado || !this.data) {
        this.horariosDisponiveis = [];
        this.horarioSelecionado = '';
        return;
      }
      
      try {
        const medicoId = this.medicoSelecionado._id;
        const response = await axios.get(`http://localhost:3000/api/agendamentos/disponibilidade?medicoId=${medicoId}&data=${this.data}`);
        this.horariosDisponiveis = response.data;
        this.horarioSelecionado = ''; 
        console.log('Horários disponíveis:', this.horariosDisponiveis);
      } catch (error) {
        console.error('Erro ao carregar horários disponíveis:', error);
        this.mensagem = 'Erro ao carregar horários disponíveis. Tente novamente.';
        this.sucesso = false;
      }
    },
    async agendar() {
      this.isLoading = true;
      this.erroData = '';
      this.erroHorario = '';
      this.mensagem = '';
      
      const hoje = new Date();
      const dataSelecionada = new Date(this.data + 'T' + this.horarioSelecionado);

      if (dataSelecionada < hoje) {
        this.erroHorario = 'Não é possível agendar em um horário no passado.';
        this.isLoading = false;
        return;
      }
      
      const novoAgendamento = {
        pacienteId: this.pacienteDados._id,
        medicoId: this.medicoSelecionado._id,
        data: this.data,
        horario: this.horarioSelecionado,
      };

      try {
        const response = await axios.post('http://localhost:3000/api/agendamentos', novoAgendamento);
        this.mensagem = response.data.message || 'Atendimento agendado com sucesso!';
        this.sucesso = true;
        this.resetForm();
      } catch (error) {
        this.mensagem = error.response?.data?.message || 'Erro ao agendar atendimento. Tente novamente.';
        this.sucesso = false;
        console.error('Erro no agendamento:', error);
      } finally {
        this.isLoading = false;
      }
    },
    resetForm() {
      const today = new Date();
      const formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      
      this.cpfBusca = '';
      this.paciente = '';
      this.pacienteEncontrado = false;
      this.pacienteNaoEncontrado = false;
      this.pacienteDados = {};
      this.erroCpf = '';
      this.erroData = '';
      this.erroHorario = '';
      
      this.especialidadeSelecionada = '';
      this.medicoSelecionado = null;
      this.data = formattedDate;
      this.horarioSelecionado = '';
      this.medicosFiltrados = [];
      this.horariosDisponiveis = [];
      this.carregarHorariosDisponiveis();
    }
  }
};
</script>

<style scoped>
.agendar-atendimentos-container {
  padding: 40px;
}
.page-title {
  font-size: 2em;
  margin-bottom: 20px;
  color: #222;
}
.busca-paciente-container {
  max-width: 600px;
  margin: 0 auto 30px;
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 20px;
  background-color: #f9f9f9;
}
.form-group-search {
  display: flex;
  flex-direction: column;
}
.search-input-group {
  display: flex;
  gap: 10px;
  align-items: center;
}
.search-input-group input {
  flex-grow: 1;
}
.search-btn {
  padding: 10px 15px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
}
.search-btn:hover {
  background-color: #2980b9;
}
.paciente-info-card {
  margin-top: 20px;
  padding: 15px;
  background-color: #e8f5e9;
  border-left: 5px solid #4caf50;
  border-radius: 6px;
}
.paciente-info-title {
  font-weight: bold;
  font-size: 1.1em;
  color: #2e7d32;
  margin-top: 0;
  margin-bottom: 10px;
}
.paciente-info-card p {
  margin: 5px 0;
}
.paciente-nao-encontrado {
  margin-top: 15px;
  color: #e74c3c;
}
.btn-link {
  background: none;
  border: none;
  color: #3498db;
  text-decoration: underline;
  cursor: pointer;
  font-size: 1em;
  padding: 0;
}
.erro {
  color: #e74c3c;
  margin-top: 5px;
  font-size: 0.9em;
}
.agendamento-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 600px;
  margin: 0 auto;
}
.form-group {
  display: flex;
  flex-direction: column;
}
.form-group label {
  font-weight: bold;
  margin-bottom: 8px;
  color: #555;
}
.form-group input,
.form-group select {
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 1em;
  background-color: white;
}
.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #7B35E4;
  box-shadow: 0 0 0 3px rgba(123, 53, 228, 0.2);
}
.submit-btn {
  padding: 15px;
  background-color: #7B35E4;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1.1em;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.1s;
}
.submit-btn:hover {
  background-color: #6a2dc9;
  transform: translateY(-1px);
}
.alerta {
  margin-top: 20px;
  padding: 15px;
  border-radius: 8px;
  text-align: center;
  font-weight: bold;
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
</style>
