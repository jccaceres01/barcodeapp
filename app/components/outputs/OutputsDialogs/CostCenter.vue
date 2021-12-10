<template>
  <Page>
    <StackLayout>
      <ActivityIndicator :busy="$store.state.loading" v-if="$store.state.loading" />
      <Label text="Centro de Costo" fontSize="30" class="accent-bg scc-yellow" />
      <ListView for="item in costCenters" @itemTap="returnValue" width="99%" height="99%">
        <v-template>
          <StackLayout orientation="vertical" width="100%" height="100%">
            <Label text="" textWrap="true">
              <FormattedString>
                <Span class="fas" text.decode="&#xf013;"/>
                <Span :text="item.value" fontSize="35" textWrap="true" />
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
          },
          {
            id: '01-02-16',
            value: 'Excavación de Frente Minero - FALCONDO'
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
  // Start custom common variables
  @import '../../../app-variables';
  // End custom common variables

  // Custom styles
  .fa {
      color: $accent-dark;
  }

  .accent-bg {
    background: $accent-dark;
  }

  .scc-yellow {
    color: $scc-yellow;
  }

  .info {
      font-size: 20;
  }
</style>
