<script>

</script>

<template>
  <header>
    <img src="/src/components/images/burger_menu.svg" alt="бургер-меню" id="burgerMenu">
    <img src="/src/components/images/logo.svg" alt="лого" id="LogoHeader">
    <img src="/src/components/images/profilepic.svg" alt="Профиль" id="profilePic">
  </header>
  <nav id="navPanelOne">
    <Button class="navPanelSlidingButton">
      <p>Язык</p>
      <img src="/src/components/images/slidingIcon.svg" alt="слайдер" class="sliderIco">
    </Button>
    <input type="text" placeholder="Введите название новеллы..." id="searchNovelInput">
    <button id="searchBtn"><img src="/src/components/images/SearchBtn.svg" alt="Поиск" ></button>
  </nav>
</template>
  
<style>
:root{
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
header{
  min-height: 6rem;
  background-color: var(--dark_gray);
  display: flex;
  justify-content: space-between;
  align-items: center;
}
#burgerMenu{
  margin-left: 2.3rem;
  height: 1.8rem;
}
header>img:hover{
  opacity: 50%;
  cursor: pointer;
}
#profilePic{
  margin-right: 1.4rem;
  height: 4.2rem;
}

/* MAIN */
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
  color: white;
  opacity: 50%;
  width: 13.2rem;
  line-height: 1rem;
  outline: none;
  margin-left: 1.55rem;
}
#searchNovelInput::placeholder{
  color: white;
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
</style>
