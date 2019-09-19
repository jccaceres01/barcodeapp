<template>
  <Page>
    <StackLayout>
      <Label text="Centro de Costo" fontSize="20" textWrap="true" verticalAlignment="center" horizontalAlignment="center" padding="10" />
      <ListView for="item in costCenters" @itemTap="returnValue" width="99%" height="99%">
        <v-template>
          <StackLayout orientation="vertical" width="100%" height="100%">
            <Label text="" textWrap="true">
              <FormattedString>
                <Span class="fas" text.decode="&#xf013;"/>
                <Span :text="item.value" fontSize="18" />
              </FormattedString>
            </Label>
          </StackLayout>
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
