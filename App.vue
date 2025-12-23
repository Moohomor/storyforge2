<script setup>
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

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

onMounted(() => {
  const AuthBtn = document.querySelector('.AuthBtn')
  const RegBtn = document.querySelector('.RegBtn')
  const ProfBtn = document.querySelector('.ProfBtn')
  if (sid !== 'null') {
    AuthBtn.classList.toggle('NoneDisp')
    RegBtn.classList.toggle('NoneDisp')
  }
  if (sid === 'null') {
    ProfBtn.classList.toggle('NoneDisp')
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
    <a href="/"><img src="/src/components/images/logo.svg" alt="лого" id="LogoHeader"></a>
    <a href="/auth"><img src="/src/components/images/profilepic.svg" alt="Профиль" id="profilePic"></a>
    <nav class="hamMenu">
      <img src="/src/components/images/logo.svg" alt="лого" id="LogoBurgerMenu">
      <ul>
        <li>
          <router-link to="/" active-class="Active">Главная</router-link>
        </li>
        <li>
          <router-link to="/editor" active-class="Active">Редактор</router-link>
        </li>
        <li>
          <router-link to="/profile" class="ProfBtn" active-class="Active">USERNAME</router-link>
        </li>
        <li>
          <router-link to="/auth" class="AuthBtn" active-class="Active">Авторизация</router-link>
        </li>
        <li>
          <router-link to="/register" class="RegBtn" active-class="Active">Регистрация</router-link>
        </li>
      </ul>
    </nav>
  </header>
  <main>
    <RouterView />
  </main>
  <footer v-if="!route.path.startsWith('/play')">
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
main{
  min-height: 90vh;
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
.AuthH1{
  font-size: 4rem;
  text-align:center;
  margin-top: 9rem;
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

.NoneDisp{
  display: none;
}

.novelItem{
  width: 248px;
  height: 175px;
  background: linear-gradient(var(--dark_gray) 66%, var(--semi_dark_gray) 100%);
  box-shadow: 0px 4px 9.3px 3px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
  align-items: center;
}
.NovelItemPic{
  margin-top: 0.7rem;
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
#profilePic{
  margin-right: 1.4rem;
  height: 4.2rem;
}
#profilePic.active{
  display: none;
}
#profilePic:hover{
  opacity: 50%;
}
#LogoHeader:hover{
  opacity: 50%;
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
.hamMenu>ul>li>a.Active{
  color: var(--orange);
  width: fit-content;
  padding: 0;
  transition: .2s ease;
}
.hamMenu>ul{
  list-style-type: none;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.hamMenu>ul>li>a{
  text-decoration: none;
  color: var(--white);
}
.hamMenu>ul>li{
  padding: 0;
  margin: 4rem 0 0 0;
}
.Active::after{
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
  height: 15rem;
  background-color: var(--dark_gray);
  display: flex;
  align-items: center;
  margin-bottom: 5.2rem;
  justify-content: center;
}
#authContainer>p{
  margin-top: 0.6rem;
  font-size: 1.5rem;
  margin-bottom: 0.8rem;
  width: 22.4rem;
}
#authContainer>p>a{
  text-decoration: none;
  color: var(--orange);
}
#authContainer>p>span>a{
  color: var(--orange);
  text-decoration: none;
}
#authContainer>p>a:hover{
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
.novels{
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 10rem;
}
.novels>h2{
  align-self: flex-start;
  margin: 1.5rem 0 1.5rem 1.5rem;
}
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
  height: 15rem;
  margin-top: 5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  margin-top: auto;
}
footer>p{
  font-size: 0.9rem;
}


/* Auth.vue */
.AuthContainer{
  width: 100%;
  height: 28rem;
  background-color: var(--dark_gray);
  margin-bottom: 10rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.AuthContainer>form{
  display: flex;
  flex-direction: column;
}
.AuthContainer>form>label{
  display: block;
  color: var(--white);
  font-size: 1.6rem;
}
.AuthContainer>form>#pasLb{
  margin-top: 2rem;
}
.AuthContainer>form>input{
  display: block;
  width: 27.6rem;
  height: 4.4rem;
  font-size: 1.6rem;
  background-color: var(--light_gray);
  border: none;
  padding: 0;
  color: var(--white);
}
.AuthContainer>p>a{
  text-decoration: none;
  color: var(--orange);
}
.AuthContainer>p>a:hover{
  opacity: 50%;
}
.AuthContainer>p{
  margin-top: 2rem;
}
.AuthContainer>form>.authBtn{
  width: 12rem;
  height: 3rem;
  color: var(--white);
  background-color: var(--orange);
  align-self: center;
  border-radius: 0.5rem;
  font-size: 1.6rem;
  border: none;
  margin-top: 1.8rem;
}

.AuthContainer>form>.authBtn:hover{
  cursor: pointer;
  background-color: var(--semi_dark_gray);
}
.AuthContainer>form>.authBtn:active{
  background-color: var(--orange);
  box-shadow: inset 0px 6px 4px rgba(0, 0, 0, 0.34);
}

/* register.vue */
.RegisterContainer{
  width: 100%;
  height: 34.5rem;
  background-color: var(--dark_gray);
  margin-bottom: 10rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.RegisterContainer>form{
  display: flex;
  flex-direction: column;
}
.RegisterContainer>form>label{
  display: block;
  color: var(--white);
  font-size: 1.6rem;
}
.RegisterContainer>form>#pasLb{
  margin-top: 2rem;
}
.RegisterContainer>form>input{
  display: block;
  width: 27.6rem;
  height: 4.4rem;
  font-size: 1.6rem;
  background-color: var(--light_gray);
  border: none;
  padding: 0;
  color: var(--white);
}
.RegisterContainer>p>a{
  text-decoration: none;
  color: var(--orange);
}
.RegisterContainer>p>a:hover{
  opacity: 50%;
}
.RegisterContainer>p{
  margin-top: 2rem;
}
.RegisterContainer>form>.authBtn{
  width: 21.8rem;
  height: 3rem;
  color: var(--white);
  background-color: var(--orange);
  align-self: center;
  border-radius: 0.5rem;
  font-size: 1.6rem;
  border: none;
  margin-top: 1.8rem;
}
.RegisterContainer>form>.authBtn:hover{
  cursor: pointer;
  background-color: var(--semi_dark_gray);
}
.RegisterContainer>form>.authBtn:active{
  background-color: var(--orange);
  box-shadow: inset 0px 6px 4px rgba(0, 0, 0, 0.34);
}

/* library.vue */
.myNovelItem{
  background-color: var(--light_gray);
  width: 100%;
  height: 6rem;
}

#ContinueContainer{
  width: 100%;
  height: 15rem;
  background-color: var(--dark_gray);
  display: flex;
  align-items: center;
  margin-bottom: 5.2rem;
  justify-content: center;
}
#ContinueContainer>p{
  margin-top: 0.6rem;
  font-size: 1.5rem;
  margin-bottom: 0.8rem;
  width: 23.4rem;
}
#ContinueContainer>p>a{
  text-decoration: none;
  color: var(--orange);
}
#ContinueContainer>p>span>a{
  color: var(--orange);
  text-decoration: none;
}
#ContinueContainer>p>a:hover{
  opacity: 50%;
}
</style>
