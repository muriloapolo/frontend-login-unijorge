<template>
  <div id="servicos">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap" rel="stylesheet">
    
    <h2 class="titulo-servicos">Nossos Serviços</h2>
    
    <div class="servico-card">
      <div class="card-imagem">
        <img src="../../assets/image/placeholder.webp" alt="Médico atendendo paciente" class="imagem-responsiva">
      </div>
      <div class="card-conteudo">
        <h3>Clínica Geral</h3>
        <p>Consultas de rotina, check-ups e acompanhamento de diversas condições de saúde.</p>
      </div>
    </div>

    <div class="servico-card">
      <div class="card-imagem">
        <img src="../../assets/image/placeholder.webp" alt="Eletrocardiograma (ECG)" class="imagem-responsiva">
      </div>
      <div class="card-conteudo">
        <h3>Cardiologia</h3>
        <p>Diagnóstico e tratamento de doenças do coração e do sistema circulatório.</p>
      </div>
    </div>

    <div class="servico-card">
      <div class="card-imagem">
        <img src="../../assets/image/placeholder.webp" alt="Tubos de ensaio em um laboratório" class="imagem-responsiva">
      </div>
      <div class="card-conteudo">
        <h3>Exames Laboratoriais</h3>
        <p>Realizamos uma ampla gama de exames de sangue, urina e outros para um diagnóstico preciso.</p>
      </div>
    </div>
    
    <div class="servico-card">
      <div class="card-imagem">
        <img src="../../assets/image/placeholder.webp" alt="Imagem que remete a ginecologia" class="imagem-responsiva">
      </div>
      <div class="card-conteudo">
        <h3>Ginecologia</h3>
        <p>Cuidado completo da saúde da mulher em todas as fases da vida, desde consultas de rotina a exames específicos.</p>
      </div>
    </div>

  </div>
</template>

<script>
export default {
  name: 'Servicos'
}
</script>

<style scoped>
/* Estilos para a página de serviços */
#servicos {
  padding: 40px 20px;
  background-image: url('../../assets/image/servicos.jpg');
  background-size: cover; /* Cobre todo o contêiner */
  background-position: center; /* Centraliza a imagem */
  background-repeat: no-repeat; /* Evita repetição da imagem */ 
  
}

/* * Ajustando a fonte para todos os elementos
 * Você pode colocar isso em um arquivo de estilos global se quiser.
 */
#servicos, #servicos h2, #servicos h3, #servicos p {
  font-family: 'Roboto', sans-serif;
}

.titulo-servicos {
  text-align: center;
  margin-bottom: 40px;
  font-size: 4em; /* Fonte maior para o título */
  color: #7c90c0; /* Uma cor escura e neutra */
  text-transform: uppercase;
}

.servico-card {
  display: flex;
  justify-content: center;
  flex-direction: row;
  align-items: center;
  width: 90%;
  background-color: #fde2e2; /* Fundo branco para o card */
  border-radius: 12px;
  box-shadow: 0 6px 10px rgba(0, 0, 0, 0.08);
  margin: 40px auto ;
  gap: 30px;
  overflow: hidden;
  border: 1px solid #81b7ed; /* Borda sutil */
}
.servico-card:hover {
  transform: translateY(-5px); /* Move o card 5px para cima */
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15); /* Sombra mais intensa */
}

.card-imagem {
  flex: 1;
}

.imagem-responsiva {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-conteudo {
  flex: 2;
  padding: 30px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.card-conteudo h3 {
  font-size: 2em;
  color: #227bd3; /* Uma cor escura para o título */
  margin-bottom: 12px;
  font-weight: 700;
}

.card-conteudo p {
  font-size: 2em; /* Fonte um pouco maior para o parágrafo */
  color: #6c757d; /* Uma cor mais clara para o parágrafo */
  line-height: 1.6;
}

/* ------------------------------------------- */
/* Media Query para dispositivos móveis */
/* ------------------------------------------- */
@media (max-width: 768px) {
  .servico-card {
    flex-direction: column;
    text-align: center;
  }
  
  .card-conteudo {
    flex: auto;
  }

  .card-conteudo h3 {
    margin-top: 15px;
  }
}
</style>  