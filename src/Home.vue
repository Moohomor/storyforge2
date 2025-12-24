<template>
  <nav id="navPanelOne">
      <Button class="navPanelSlidingButton">
        <p>Язык</p>
        <img src="/src/components/images/slidingIcon.svg" alt="слайдер" class="sliderIco">
      </Button>
      <input type="text" placeholder="Введите название новеллы..." id="searchNovelInput">
      <button id="searchBtn"><img src="/src/components/images/searchBtn.svg" alt="Поиск" ></button>
    </nav>
    <section id="continue">
      <h2>Продолжить игру</h2>
      <div id="authContainer">
        <h3>Ой... Похоже вы еще не авторизовались.</h3>
        <input type="text" id="login" placeholder="Email или логин" class="authInput">
        <input type="password" id="password" placeholder="Пароль" class="authInput">
        <button id="logBtn">Войти</button>
        <p>Еще нет аккаунта? <span><a href="#">Создать аккаунт</a></span></p>
      </div>
    </section>
    <section id="novels">
      <nav id="navPanelTwo">
        <Button class="navPanelSlidingButton">
        <p>Фильтры</p>
        <img src="/src/components/images/slidingIcon.svg" alt="слайдер" class="sliderIco">
      </Button>
      </nav>
      <p id="errorEmptyContent">ОЙ! похоже здесь пока что ничего нет...</p>
    </section>
</template>