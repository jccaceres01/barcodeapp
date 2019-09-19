<template>
  <Page>
    <ActionBar title="Seleccionar Fecha" />
    <StackLayout orientation="vertical">
      <DatePicker v-model="date" />
      <Button text="Seleccionar" @tap="sendDate" />
    </StackLayout>
  </Page>
</template>

<script>
  export default {
    data() {
      return {
        date: new Date()
      }
    },
    methods: {
      sendDate() {
        this.$modal.close(this.date)
      }
    }
  }
</script>

<style lang="scss" scoped>
  // Start custom common variables
  @import '../../../app-variables';
  // End custom common variables

  // Custom styles
  .fas {
    color: $accent-dark;
  }

  .desc {
    font-size: 16;
    color: #747474;
  }

  .info {
      font-size: 20;
  }
</style>
