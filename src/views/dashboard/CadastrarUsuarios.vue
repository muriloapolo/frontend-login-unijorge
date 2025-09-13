<template>
  <div class="cadastro-container">
    <h1 class="page-title">Cadastro de Usuários</h1>

    <div class="form-group-type">
      <label for="tipoUsuario">Tipo de Usuário:</label>
      <select id="tipoUsuario" v-model="tipoUsuario" class="form-select-type">
        <option value="paciente">Paciente</option>
        <option value="medico">Médico</option>
        <option value="secretario">Secretário</option>
      </select>
    </div>

    <form @submit.prevent="cadastrar" class="cadastro-form">
      <div class="form-section">
        <h3>Dados Básicos</h3>
        <div class="form-group">
          <label for="nome">Nome Completo</label>
          <input type="text" id="nome" v-model="usuario.nome" required />
        </div>
        <div class="form-group">
          <label for="cpf">CPF</label>
          <input type="text" id="cpf" v-model="usuario.cpf" required />
        </div>
        <div class="form-group">
          <label for="email">E-mail</label>
          <input type="email" id="email" v-model="usuario.email" required />
        </div>
      </div>
      <div v-if="tipoUsuario === 'paciente'" class="form-section">
        <h3>Dados do Paciente</h3>
        <div class="form-group">
          <label for="telefonePac">Telefone</label>
          <input
            type="tel"
            id="telefonePac"
            v-model="usuario.telefone"
            required
          />
        </div>
        <div class="form-group">
          <label for="cep">CEP</label>
          <input
            type="text"
            id="cep"
            v-model="usuario.cep"
            @blur="buscarEnderecoPorCep"
            required
          />
          <p v-if="erroCep" class="erro">{{ erroCep }}</p>
        </div>
        <div class="form-group">
          <label for="logradouro">Rua</label>
          <input
            type="text"
            id="logradouro"
            v-model="usuario.logradouro"
            
          />
        </div>
        <div class="form-group-inline">
          <div class="form-group">
            <label for="numero">Número</label>
            <input type="text" id="numero" v-model="usuario.numero" required />
          </div>
          <div class="form-group">
            <label for="complemento">Complemento</label>
            <input type="text" id="complemento" v-model="usuario.complemento" />
          </div>
        </div>
        <div class="form-group-inline">
          <div class="form-group">
            <label for="cidade">Cidade</label>
            <input type="text" id="cidade" v-model="usuario.cidade" readonly />
          </div>
          <div class="form-group">
            <label for="estado">Estado</label>
            <input type="text" id="estado" v-model="usuario.estado" readonly />
          </div>
        </div>
      </div>

      <div v-if="tipoUsuario === 'medico'" class="form-section">
        <h3>Dados do Médico</h3>
        <div class="form-group">
          <label for="crm">CRM</label>
          <input type="text" id="crm" v-model="usuario.crm" required />
        </div>
        <div class="form-group">
          <label for="especialidade">Especialidade</label>
          <select id="especialidade" v-model="usuario.especialidade" required>
            <option value="" disabled selected>
              Selecione uma especialidade
            </option>
            <option v-for="esp in especialidades" :key="esp" :value="esp">
              {{ esp }}
            </option>
          </select>
        </div>
      </div>

      <div v-if="tipoUsuario === 'secretario'" class="form-section">
        <h3>Dados do Secretário</h3>
        <div class="form-group">
          <label for="telefoneSec">Telefone</label>
          <input
            type="tel"
            id="telefoneSec"
            v-model="usuario.telefone"
            required
          />
        </div>
        <div class="form-group">
          <label for="senhaSec">Senha</label>
          <input type="password" id="senhaSec" v-model="usuario.password" required />
        </div>
      </div>

      <button type="submit" class="submit-btn-moderno" :disabled="isLoading">
        <span v-if="isLoading">Cadastrando...</span>
        <span v-else>
          Cadastrar
          {{
            tipoUsuario === "medico"
              ? "Médico"
              : tipoUsuario === "secretario"
              ? "Secretário"
              : "Paciente"
          }}
        </span>
      </button>
    </form>
    
    <transition name="modal-fade">
      <div v-if="showModal" class="modal-overlay" @click="closeModal">
        <div :class="['modal-content', { 'modal-sucesso': sucesso, 'modal-erro': !sucesso }]" @click.stop>
          <div class="modal-body">
            <p v-if="sucesso">
              <b>{{ tipoUsuario.charAt(0).toUpperCase() + tipoUsuario.slice(1) }}</b> Cadastrado com sucesso!
            </p>
            <p v-else>
              <b>Erro: {{ mensagem }}</b> 
            </p>
          </div>
          <button class="modal-close-btn" @click="closeModal">OK</button>
        </div>
      </div>
    </transition>


  </div>
</template>

<script type="module">
import axios from 'axios';

export default {
  name: "CadastrarUsuarios",
  data() {
    return {
      apiBaseUrl: 'https://backend-fullstack-ebon.vercel.app', 
      tipoUsuario: "paciente",
      usuario: {
        nome: "",
        email: "",
        password: "",
        cpf: "",
        crm: "",
        especialidade: "",
        telefone: "",
        cep: "",
        logradouro: "",
        numero: "",
        complemento: "",
        cidade: "",
        estado: "",
      },
      especialidades: ["Cardiologia", "Dermatologia", "Pediatria", "Otorrino"],
      erroCep: "",
      
      mensagem: "",
      sucesso: false,
      isLoading: false,
      showModal: false,
      timer: null,
    };
  },
  watch: {
    tipoUsuario() {
      // Limpa os dados do formulário ao trocar o tipo de usuário
      this.usuario = {
        nome: "",
        email: "",
        password: "",
        cpf: "",
        crm: "",
        especialidade: "",
        telefone: "",
        cep: "",
        logradouro: "",
        numero: "",
        complemento: "",
        cidade: "",
        estado: "",
      };
      this.erroCep = "";
      this.clearFeedback();
    },
  },
  methods: {
    async buscarEnderecoPorCep() {
      this.erroCep = "";
      const cep = this.usuario.cep.replace(/\D/g, "");

      if (cep.length !== 8) {
        this.erroCep = "CEP inválido. Digite 8 dígitos.";
        this.limparEndereco();
        return;
      }

      try {
        const response = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
        const data = response.data;

        if (data.erro) {
            this.erroCep = "CEP não encontrado.";
            this.limparEndereco();
        } else {
          this.usuario.logradouro = data.logradouro;
          this.usuario.cidade = data.localidade;
          this.usuario.estado = data.uf;
        }
      } catch (error) {
        this.erroCep = "Erro ao buscar o CEP. Tente novamente.";
        this.limparEndereco();
        console.error("Erro na requisição ViaCEP:", error);
      }
    },
    limparEndereco() {
      this.usuario.logradouro = "";
      this.usuario.cidade = "";
      this.usuario.estado = "";
    },
    async cadastrar() {
      this.isLoading = true;
      this.clearFeedback();

      const token = localStorage.getItem('authToken');
      if (!token) {
        this.showFeedback('Usuário não autenticado. Faça login novamente.', false);
        this.isLoading = false;
        return;
      }

      // Validação simples de CPF
      const cpf = this.usuario.cpf.replace(/\D/g, '');
      if (cpf.length !== 11) {
        this.showFeedback('CPF inválido. Certifique-se de que ele tem 11 dígitos.', false);
        this.isLoading = false;
        return;
      }

      try {
        // Prepara os dados do usuário para o backend de forma dinâmica
        let dadosParaApi = {
          nome: this.usuario.nome,
          email: this.usuario.email,
          cpf: this.usuario.cpf,
        };

        if (this.tipoUsuario === 'paciente') {
          dadosParaApi = {
            ...dadosParaApi,
            telefone: this.usuario.telefone,
            cep: this.usuario.cep,
            logradouro: this.usuario.logradouro,
            numero: this.usuario.numero,
            complemento: this.usuario.complemento,
            cidade: this.usuario.cidade,
            estado: this.usuario.estado,
          };
        } else if (this.tipoUsuario === 'medico') {
          dadosParaApi = {
            ...dadosParaApi,
            crm: this.usuario.crm,
            especialidade: this.usuario.especialidade,

          };
        } else if (this.tipoUsuario === 'secretario') {
          dadosParaApi = {
            ...dadosParaApi,
            telefone: this.usuario.telefone,
            password: this.usuario.password,
          };
        }

        const url = `${this.apiBaseUrl}/api/${this.tipoUsuario}s/register`;
        const response = await axios.post(url, dadosParaApi, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        this.showFeedback(`Cadastro de ${this.tipoUsuario} realizado com sucesso!`, true);
        this.resetForm();

      } 
      catch (error) {
        let mensagem = 'Erro ao cadastrar usuário. Verifique sua conexão e tente novamente.';
        if (error.response) {
          if (error.response.status === 409) {
            mensagem = 'Este usuário (Email ou CPF) já está cadastrado.';
          } else {
            mensagem = error.response.data?.message || `Erro ${error.response.status}: ${error.response.statusText}`;
          }
        }
        this.showFeedback(mensagem, false);
        console.error("Erro no cadastro:", error);
      } finally {
        this.isLoading = false;
      }
        
    },
    resetForm() {
      this.usuario = {
        nome: "",
        email: "",
        password: "",
        cpf: "",
        crm: "",
        especialidade: "",
        telefone: "",
        cep: "",
        logradouro: "",
        numero: "",
        complemento: "",
        cidade: "",
        estado: "",
      };
      this.tipoUsuario = this.tipoUsuario;
      this.erroCep = "";
    },
    showFeedback(message, isSuccess) {
      if (this.timer) {
        clearTimeout(this.timer);
      }
      
      this.mensagem = message;
      this.sucesso = isSuccess;
      this.showModal = true;
      
      this.timer = setTimeout(() => {
        this.closeModal();
      }, 3000);
    },
    closeModal() {
      this.showModal = false;
      this.clearFeedback();
    },
    clearFeedback() {
      if (this.timer) {
        clearTimeout(this.timer);
      }
      this.mensagem = '';
      this.sucesso = false;
    }
  },
};
</script>

<style scoped>
.cadastro-container {
  padding: 40px;
}
.page-title {
  font-size: 2em;
  margin-bottom: 20px;
  color: #222;
}
.form-group-type {
  margin-bottom: 20px;
}
.form-select-type {
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 1em;
  background-color: white;
  width: 200px;
}
.cadastro-form {
  display: flex;
  flex-direction: column;
  gap: 30px;
  max-width: 600px;
  margin: 0 auto;
}
.form-section {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 25px;
}
.form-section h3 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #555;
}
.form-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 15px;
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
  border-color: #7b35e4;
  box-shadow: 0 0 0 3px rgba(123, 53, 228, 0.2);
}
.form-group-inline {
  display: flex;
  gap: 20px;
}
.form-group-inline .form-group {
  flex: 1;
}
.submit-btn-moderno {
  width: 100%;
  padding: 16px;
  background-color: #7b35e4;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1.2em;
  font-weight: bold;
  cursor: pointer;
  margin-top: 10px;
  transition: background-color 0.2s ease-in-out, transform 0.1s ease-in-out;
}
.submit-btn-moderno:hover {
  background-color: #6a2dc9;
  transform: translateY(-1px);
}
.erro {
  color: #e74c3c;
  margin-top: 5px;
}

/* Estilos para o modal centralizado */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.modal-content {
  background-color: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  text-align: center;
  max-width: 400px;
  width: 90%;
}
.modal-sucesso {
  border: 2px solid #28a745;
}
.modal-erro {
  border: 2px solid #dc3545;
}
.modal-body {
  margin-bottom: 20px;
  font-size: 1.1em;
  font-weight: bold;
  color: #333;
}
.modal-close-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 1em;
  cursor: pointer;
  background-color: #7b35e4;
  color: white;
  transition: background-color 0.2s;
}
.modal-close-btn:hover {
  background-color: #6a2dc9;
}

/* Transições para o modal */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}
.modal-fade-enter,
.modal-fade-leave-to {
  opacity: 0;
}
</style>
