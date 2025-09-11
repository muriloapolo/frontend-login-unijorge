<template>
  <div id="app">
    <MenuBar v-if="showMenuBar" />

    <main class="main-content">
      <router-view></router-view>
    </main>

    <Rodape class="footer-bottom"/>
  </div>
</template>

<script>
import MenuBar from './components/menubar/MenuBar.vue';
import Rodape from './components/footer/Rodape.vue';

export default {
  name: 'App',
  components: {
    MenuBar,
    Rodape
  },
  computed: {
    // Retorna 'true' se a rota NÃO começar com '/dashboard'
    showMenuBar() {
      return !this.$route.path.startsWith('/dashboard');
    }
  }
};
</script>

<style>
/* Estilos globais e de layout */
html, body {
  height: 100%;
}
#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
.main-content {
  flex-grow: 1;
}
.footer-bottom {
  position: relative;
  z-index: 10;
}
</style>