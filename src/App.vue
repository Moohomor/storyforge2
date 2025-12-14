<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  const burgerMenu = document.querySelector('.burgerMenu')
  const hamMenu = document.querySelector('.hamMenu')
  const profilePic = document.querySelector('#profilePic')
  const LogoHeader = document.querySelector('#LogoHeader')
  
  if (burgerMenu) {
    burgerMenu.addEventListener('click', () => {
      burgerMenu.classList.toggle('active')
      hamMenu.classList.toggle('active')
      profilePic.classList.toggle('active')
      LogoHeader.classList.toggle('active')
    })
  }
})
</script>

<template>
  <header>
      <div class="burgerMenu">
        <span></span>
        <span></span>
        <span></span>
      </div>
    <a href="App.vue"><img src="/src/components/images/logo.svg" alt="лого" id="LogoHeader"></a>
    <a href="#"><img src="/src/components/images/profilepic.svg" alt="Профиль" id="profilePic"></a>
    <nav class="hamMenu">
      <img src="/src/components/images/logo.svg" alt="лого" id="LogoBurgerMenu">
      <li>
        <a href="App.vue" ><ul id="homeBtn">Главная</ul></a>
        <a href="#"><ul>Редактор</ul></a>
        <a href="#"><ul>Авторизация</ul></a>
      </li>
    </nav>
  </header>
  <main>
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
  </main>
  <footer>
    <img src="/src/components/images/logo.svg" alt="лого" id="LogoFooter">
    <p>desing by @NE_KTA_RYN_KIUwU</p>
  </footer>
</template>
  
<style>
#app{
  display: flex ;
  flex-direction: column;
}
body{
  display: flex ;
  flex-direction: column;
}
html:root{
  font-size: 62.5%;
  --black: rgb(12, 13, 12);
  --dark_gray: rgb(51, 51, 51);
  --semi_dark_gray: rgb(88, 89, 89);
  --semi_dark_gray_two: rgb(99, 99, 99);
  --light_gray: rgb(123, 123, 123);
  --semi_light_gray: rgb(166, 166, 166);
  --semi_light_gray_two: rgb(217, 217, 217);
  --white: rgb(255, 255, 255);
  --orange: rgb(230, 120, 3);
  background-color: var(--semi_dark_gray);
}
button{
  padding: 0;
}
h1{
  margin: 0;
  color: var(--white);
}
h2{
  margin: 0;
  color: var(--white);
}
h3{
  margin: 0;
  color: var(--white);
}
p{
  margin: 0;
  color: var(--white);
}
/* HEADER */
#LogoHeader{
  height: 4.2rem;
}
#LogoHeader.active{
  display: none;
}
#LogoBurgerMenu{
  margin-top: 1rem;
}
header{
  min-height: 6rem;
  background-color: var(--dark_gray);
  display: flex;
  justify-content: space-between;
  align-items: center;
}
header>.burgerMenu{
  z-index: 2;
  margin-left: 2.3rem;
  height: 1.6rem;
  width: 2.4rem;
  position: relative;
}
header>.burgerMenu:hover{
  opacity: 50%;
}
header>.burgerMenu>span{
  display: block;
  height: 0.2rem;
  width: 100%;
  background-color: var(--white);
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  transition: .3s ease;
}
header>.burgerMenu>span:nth-child(1){
  top: 0%;
}
header>.burgerMenu>span:nth-child(3){
  top: 100%;
}
header>.burgerMenu.active span:nth-child(1){
  top: 50%;
  transform: translate(-50%, -50%) rotate(45deg);
}
header>.burgerMenu.active span:nth-child(2){
  opacity: 0;
}
header>.burgerMenu.active span:nth-child(3){
  top: 50%;
  transform: translate(-50%, -50%) rotate(-45deg);
}
header>a:hover{
  opacity: 50%;
  cursor: pointer;
}
#profilePic{
  margin-right: 1.4rem;
  height: 4.2rem;
}
#profilePic.active{
  display: none;
}
.hamMenu{
  background-color: var(--dark_gray);
  opacity: 80%;
  height: 100%;
  width: 100%;
  position: fixed;
  opacity: 0;
  display: flex;
  flex-direction: column;
  justify-content:flex-start;
  align-items: center;
  font-size: 2rem;
  transition: .2s ease; 
  z-index: -1;
}
.hamMenu.active {
  opacity: 80%;
  top: 0;
  z-index: 1;
}
.hamMenu>li{
  list-style-type: none;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.hamMenu>li>a{
  text-decoration: none;
  color: var(--white);
}
.hamMenu>li>a>ul{
  padding: 0;
  margin: 4rem 0 0 0;
}
.hamMenu>li>a:hover{
  opacity: 50%;
}
#homeBtn{
  color: var(--orange);
  width: fit-content;
  padding: 0;
}

#homeBtn::after{
  content: "";
  display: block;
  background: var(--orange);
  width: 100%;
  height: 0.2rem;
}
/* MAIN */
main{
  flex: 1 0 auto;
}
#navPanelOne{
  background-color: var(--semi_dark_gray_two);
  display: flex;
  padding-left: 5.6rem;
  height: 3rem;
  align-items: center;
}
.navPanelSlidingButton{
  display: flex;
  gap: 0.2rem;
  background-color: var(--semi_dark_gray_two);
  border: none;
}
.navPanelSlidingButton:hover{
  opacity: 50%;
  cursor: pointer;
}
.sliderIco{
  width: 0.8rem;
  height: 1.15rem;
}
#searchNovelInput{
  border: none;
  font-size: 8px;
  padding: 0.7rem 0.5rem 0.7rem 0.5rem;
  background-color: var(--semi_light_gray);
  opacity: 50%;
  width: 13.2rem;
  color: var(--white);
  line-height: 1rem;
  outline: none;
  margin-left: 1.55rem;
}
#searchNovelInput::placeholder{
  color: var(--white);
}
#searchBtn{
  border: none;
  background-color: var(--semi_dark_gray);
  width: 2.4rem;
  height: 2.4rem;
}
#searchBtn:hover{
  opacity: 50%;
  cursor: pointer;
}

/* CONTINUE SECTION */
#continue{
  display: flex;
  flex-direction: column;
  align-items: center;
}

#continue>h2{
  margin: 1.5rem 0 1.5rem 1.5rem;
  font-size: 1.5rem;
  align-self: flex-start;
}
#authContainer{
  width: 100%;
  height: 18rem;
  background-color: var(--dark_gray);
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 5.2rem;
}
#authContainer>h3{
  text-align: center;
  font-size: 1.3rem;
  padding-top: 1.8rem;
}
.authInput{
  width: 24rem;
  height: 3rem;
  align-self: center;
  opacity: 50%;
  background-color: var(--semi_light_gray);
  color: var(--white);
  outline: none;
  border-radius: 0.2rem;
  border: none;
}
.authInput::placeholder{
  color: var(--white);
}
#login{
  margin-top: 2rem;
}
#password{
  margin-top: 1.5rem;
  margin-bottom: 1rem;
}
#authContainer>p{
  margin-top: 0.6rem;
  font-size: 0.6rem;
  margin-bottom: 0.8rem;
}
#authContainer>p>span>a{
  color: var(--orange);
  text-decoration: none;
}
#authContainer>p>span>a:hover{
  opacity: 50%;
}
#logBtn{
  width: 10rem;
  height: 2.4rem;
  color: var(--white);
  background-color: var(--semi_dark_gray);
  border: none;
  border-radius: 0.3rem;
}
#logBtn:hover{
  opacity: 50%;
  cursor: pointer;
}

/* NOVELS SECTION */
#navPanelTwo{
  background-color: var(--semi_dark_gray_two);
  display: flex;
  padding-left: 5.6rem;
  height: 3rem;
  align-items: center;
}
/* FOOTER */
footer{
  background-color: var(--dark_gray);
  min-width: 32rem;
  height: 8rem;
  margin-top: 2.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}
#logoFooter{
  align-self: center;
}
footer>p{
  font-size: 0.9rem;
}
#errorEmptyContent{
  margin: 15rem 0 15rem 0rem;
  font-size: 3rem;
  text-align: center;
}
</style>
