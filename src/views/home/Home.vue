<template>
  <div class="home-container">
    <div class="content-wrapper">
      <p class="texto-boas-vindas">Seja bem-vindo à Clínica Unijorge</p>
      <p class="texto-generico">
        Atendimento de segunda a sexta, das 8h às 18h.<br />
        Telefone: (71) 99999-9999<br />
        Agende sua consulta online ou ligue para nós.
      </p>
    </div>
  </div>
</template>

<script>
export default {
  name: "Home",
};
</script>

<style scoped>
.home-container {
  background-image: url("../../assets/image/blur-hospital.jpg"); /* **ATENÇÃO: Substitua 'nome-da-sua-imagem.jpg' pelo nome real do arquivo da sua imagem e ajuste o caminho se necessário.** */
  background-size: cover; /* Cobre todo o contêiner */
  background-position: center; /* Centraliza a imagem */
  background-repeat: no-repeat; /* Evita repetição da imagem */
  height: calc(100vh - 90px); /* Altura total da viewport */
  display: flex; /* Para centralizar o conteúdo */
  justify-content: center; /* Centraliza horizontalmente */
  align-items: center; /* Centraliza verticalmente */
  color: white; /* Cor do texto para contraste com o fundo */
  text-align: center; /* Centraliza o texto */
  position: relative; /* Para o overlay e posicionamento do texto */
  z-index: 1; /* Garante que o conteúdo fique acima do fundo */
}

/* Um overlay sutil para melhorar a legibilidade do texto */
.home-container::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.3); /* Um leve escurecimento */
  z-index: -1; /* Fica abaixo do conteúdo, mas acima da imagem */
}

.content-wrapper {
  padding: 10px;
  background-color: rgba(255, 255, 255, 0.1); /* Um fundo suave para o texto */
  border-radius: 10px;
}

.texto-boas-vindas {
  font-size: 3em; /* Tamanho maior para destaque */
  font-weight: bold;
  margin-bottom: 20px;
  color: #b0e0e6; /* Um azul celeste claro, que transmite tranquilidade e higiene hospitalar */
}

.texto-generico {
  font-size: 1.2em;
  line-height: 1.6;
  color: #e0ffff; /* Um azul esverdeado claro, sutil e legível */
}
</style>
