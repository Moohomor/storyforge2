<template>
  <nav id="navPanelOne">
    <input type="text" placeholder="Введите название новеллы..." id="searchNovelInput">
    <button id="searchBtn"><img src="/src/components/images/searchBtn.svg" alt="Поиск" /></button>
  </nav>
  <section id="continue">
    <h2>Продолжить игру</h2>
    <div id="ContinueContainer">
      <p>Ой! Похоже вы не запустили еще ни одной новеллы.<a href="#"> Играть случайную</a></p>
    </div>
  </section>
  <section class="novels">
    <h2>Случайная новелла</h2>
      <router-link to="">
        <div class="novelItem">
          <img src="/src/components/images/novelitem1.jpg" alt="КАРТИНКА НОВЕЛЛЫ" class="NovelItemPic">
          <h3>NOVEL NAME</h3>
        </div>
      </router-link>
  </section>
</template>