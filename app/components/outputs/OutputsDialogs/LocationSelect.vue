<template>
  <Page>
    <StackLayout>
      <Label text="Localizaciones" fontSize="30" />
      <ListView for="item in locations" @itemTap="returnValue" width="*" height="100%">
        <v-template>
          <Label :text="item.DESCRIPCION" fontSize="20" />
        </v-template>
      </ListView>
    </StackLayout>
  </Page>
</template>

<script>
  export default {
    data() {
      return {
      }
    },
    created() {
      if (this.locations.length == 0) {
        this.locations.push({
          BODEGA: '000',
          LOCALIZACION: '000',
          DESCRIPCION: 'Sin Bodega Seleccionada',
          VOLUMEN: 0,
          PESO_MAX: 0
        })
      }
    },
    props: ['locations'],
    methods: {
      returnValue(event) {
        this.$modal.close(event.item)
      }
    }
  }
</script>

<style lang="scss" scoped>
</style>
