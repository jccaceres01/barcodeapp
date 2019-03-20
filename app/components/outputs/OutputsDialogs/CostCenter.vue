<template>
  <Page>
    <StackLayout>
      <Label text="Centro de Costo" fontSize="30" />
      <ListView for="item in costCenters" @itemTap="returnValue" width="*" height="100%">
        <v-template>
          <Label :text="item.value" fonSize="20" />
        </v-template>
      </ListView>
    </StackLayout>
  </Page>
</template>

<script>
  export default {
    data() {
      return {
        costCenters: [
          {
            id: '01-02-11',
            value: 'Pueblo Viejo (LLD-SD1  El Llagal)'
          },
          {
            id: '01-02-13',
            value: 'Pueblo Viejo (Minería)'
          },
          {
            id: '01-02-14',
            value: ' H.S.E.- PVDC'
          }
        ]
      }
    },
    methods: {
      returnValue(event) {
        this.$modal.close(event.item)
      }
    }
  }
</script>

<style lang="scss" scoped>
</style>
