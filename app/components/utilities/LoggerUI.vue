<template>
  <Page>
    <ActionBar :title="title"  class="action-bar">
      <NavigationButton text="Atras" android.systemIcon="ic_menu_back" @tap="$navigateBack" />
    </ActionBar>

    <StackLayout orientation="vertical">
      <HtmlView :html="log" verticalAlignment="center" horizontalAlignment="center" width="100%" height="100%" />
    </StackLayout>
  </Page>
</template>

<script>
  export default {
    data() {
      return {

      }
    },
    mounted() {

    },
    props: ['title', 'log']
  }
</script>

<style lang="scss" scoped >
  // Start custom common variables
  @import '../../app-variables';
  // End custom common variables

  // Custom styles
  .fa {
    color: $accent-dark;
  }

  .fas {
    color: $accent-dark;
  }

  .info {
    font-size: 20;
  }

  .mediumicon {
    font-size: 30;
  }

  .bigicon {
    font-size: 100;
  }
</style>
