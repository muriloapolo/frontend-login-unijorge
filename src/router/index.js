import { createRouter, createWebHistory } from 'vue-router';
import { reactive } from 'vue'; // Importa a função reactive do Vue
import Home from '../views/home/Home.vue';
import Servicos from '../views/servicos/Servicos.vue';
import Dashboard from '../views/dashboard/Dashboard.vue';
import Login from '../views/login/Login.vue';
import TodosAgendamentos from '../views/agendamentos/TodosAgendamentos.vue';
import AgendarAtendimentos from '../views/agendamentos/AgendarAtendimentos.vue';
import CadastrarUsuarios from '../views/dashboard/CadastrarUsuarios.vue';
import TodosAgendamentosConfirmados from '../views/dashboard/TodosAgendamentosConfirmados.vue';

// Objeto para gerenciar o estado de autenticação reativo
export const auth = reactive({
  isAuthenticated: localStorage.getItem('authToken') !== null,

  // Método para verificar autenticação
  checkAuth() {
    this.isAuthenticated = localStorage.getItem('authToken') !== null;
    return this.isAuthenticated;
  },

  // Método para logout
  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
    this.isAuthenticated = false;
  }
});
const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/servicos',
    name: 'Servicos',
    component: Servicos
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: '/dashboard/todos-agendamentos'
      },
      {
        path: 'todos-agendamentos',
        name: 'TodosAgendamentos',
        component: TodosAgendamentos
      },
      {
        path: 'agendamentos',
        name: 'AgendarAtendimentos',
        component: AgendarAtendimentos
      },
      {
        path: 'usuarios',
        name: 'CadastrarUsuarios',
        component: CadastrarUsuarios
      },
      {
        path: 'dados-pacientes', // Nova rota para os agendamentos confirmados
        name: 'TodosAgendamentosConfirmados',
        component: TodosAgendamentosConfirmados
      }
    ]
  }
];
const router = createRouter({
  history: createWebHistory(),
  routes
});

// Guardião de Rota melhorado
router.beforeEach((to, from, next) => {
  console.log('Navegando para:', to.path, 'Autenticado:', auth.isAuthenticated);

  // Atualiza o estado de autenticação
  auth.checkAuth();

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    console.log('Acesso negado - redirecionando para login');
    next('/login');
  } else if (to.path === '/login' && auth.isAuthenticated) {
    console.log('Já autenticado - redirecionando para dashboard');
    next('/dashboard');
  } else {
    next();
  }
});

export default router;
