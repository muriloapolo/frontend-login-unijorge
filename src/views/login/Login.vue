<template>
  <div class="login-page">
    <div class="login-content-wrapper">
      <div class="login-header-moderno">
        <img src="../../assets/image/uni-logo.webp" alt="Logotipo da Clínica Unijorge" class="modal-logo-moderno">
        <h2>Bem-vindo(a)</h2>
        <p>Acesse sua conta para continuar.</p>
      </div>
      <form @submit.prevent="handleLogin" class="login-form-moderno">
        <div class="form-group-moderno">
          <label for="email" class="form-label-moderno">E-mail</label>
          <input type="email" id="email" v-model="email" required class="form-input-moderno" placeholder="seuemail@exemplo.com">
        </div>
        <div class="form-group-moderno">
          <label for="password" class="form-label-moderno">Senha</label>
          <input type="password" id="password" v-model="password" required class="form-input-moderno" placeholder="••••••••">
        </div>
        <button type="submit" class="submit-btn-moderno" :disabled="isLoading">
          <span v-if="isLoading">Entrando...</span>
          <span v-else>Entrar</span>
        </button>
      </form>
      
      <p v-if="mensagemErro" class="error-message">{{ mensagemErro }}</p>
      
      <p class="forgot-password-moderno">Esqueceu sua senha?</p>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { auth } from '../../router';

export default {
  name: 'Login',
  data() {
    return {
      email: '',
      password: '',
      isLoading: false,
      mensagemErro: ''
    };
  },
  methods: {
    async handleLogin() {
      this.isLoading = true;
      this.mensagemErro = '';

      try {
        const apiBaseUrl = 'https://backend-fullstack-ebon.vercel.app';
        const response = await axios.post(`${apiBaseUrl}/api/secretarios/login`, {
          email: this.email,
          password: this.password
        });

        if (response.status === 200) {
          // Removida a linha que extraía o token
          const { user } = response.data;
          
          // O token não é mais salvo
          localStorage.setItem('user', JSON.stringify(user));
          
          // Marca o usuário como autenticado
          auth.isAuthenticated = true; 
          
          console.log('Login bem-sucedido!');
          this.$router.push('/dashboard');
        }

      } catch (error) {
        console.error('Erro no login:', error);
        this.mensagemErro =
          error.response?.data?.message ||
          'Erro ao conectar. Verifique sua conexão ou tente novamente.';
      } finally {
        this.isLoading = false;
      }
    }
  }
};
</script>

<style scoped>
/* Estilos existentes para o Login.vue */
.login-page {
display: flex;
justify-content: center;
align-items: center;
min-height: calc(100vh - 80px);
background-color: #f8f9fa;
}
.login-content-wrapper {
background: #ffffff;
padding: 40px;
border-radius: 10px;
box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
width: 90%;
max-width: 420px;
text-align: center;
}
.modal-logo-moderno {
width: 70px;
margin-bottom: 25px;
}
.login-header-moderno {
margin-bottom: 30px;
}
.login-header-moderno h2 {
font-size: 2.2em;
color: #333;
margin-bottom: 8px;
font-weight: 700;
}
.login-header-moderno p {
color: #666;
font-size: 1.1em;
}
.login-form-moderno {
display: flex;
flex-direction: column;
gap: 20px;
}
.form-group-moderno {
text-align: left;
}
.form-label-moderno {
display: block;
margin-bottom: 10px;
font-weight: 600;
color: #333;
font-size: 1em;
}
.form-input-moderno {
width: 100%;
padding: 15px;
border: 1px solid #e0e0e0;
border-radius: 6px;
font-size: 1.1em;
transition: border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}
.form-input-moderno::placeholder {
color: #a0a0a0;
}
.form-input-moderno:focus {
outline: none;
border-color: #7B35E4;
box-shadow: 0 0 0 3px rgba(123, 53, 228, 0.2);
}
.submit-btn-moderno {
width: 100%;
padding: 16px;
background-color: #7B35E4;
color: white;
border: none;
border-radius: 6px;
font-size: 1.2em;
font-weight: bold;
cursor: pointer;
margin-top: 25px;
transition: background-color 0.2s ease-in-out, transform 0.1s ease-in-out;
}
.submit-btn-moderno:hover {
background-color: #6a2dc9;
transform: translateY(-1px);
}
.forgot-password-moderno {
margin-top: 20px;
font-size: 0.95em;
color: #7B35E4;
cursor: pointer;
transition: color 0.2s ease-in-out;
}
.forgot-password-moderno:hover {
color: #6a2dc9;
text-decoration: underline;
}
.error-message {
color: #e74c3c;
margin-top: 15px;
font-size: 0.9em;
}
</style>
