<template>
  <header class="navbar-header">
    <div class="navbar-container">
      <div class="logo-wrapper">
        <img src="../../assets/image/uni-logo.webp" alt="Logotipo da Clínica Unijorge" class="logo">
      </div>

      <nav class="nav-links">
        <router-link to="/" class="nav-item">Home</router-link>
        <router-link to="/servicos" class="nav-item">Serviços</router-link>
        <div class="login-wrapper">
          <router-link to="/login" class="nav-item login-link">Login</router-link>
        </div>
      </nav>
    </div>
  </header>
</template>

<script>
export default {
  name: 'MenuBar'
};
</script>

<style scoped>
.navbar-header {
  background-color: #004d40;
  padding: 5px 30px;
  color: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.navbar-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo-wrapper {
  display: flex;
  align-items: center;
}

.logo {
  height: 80px;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 40px;
}

.nav-item {
  color: white;
  text-decoration: none;
  font-size: 1.1em;
  transition: color 0.3s;
}

.nav-item:hover {
  color: #80cbc4;
}

.login-wrapper {
  border: 2px solid #80cbc4;
  padding: 8px 15px;
  border-radius: 50px;
  transition: background-color 0.3s, border-color 0.3s;
}

.login-wrapper:hover {
  background-color: #006064;
  border-color: #80cbc4;
}

.login-link {
  font-weight: bold;
}
</style>