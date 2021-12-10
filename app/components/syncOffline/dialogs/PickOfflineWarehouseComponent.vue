<template>
  <Page>
    <ActionBar class="action-bar" title="Seleccionar Bodega" />

    <StackLayout orientation="vertical">
      <ActivityIndicator :busy="$store.state.loading" v-if="$store.state.loading" />
      <Label text="Seleccionar Bodega" fontSize="30" textWrap="true" class="accent-bg scc-yellow" />
      <!-- List  of items -->
      <ListView for="(item, index) in bodegas" @itemTap="pickThis" height="100%">
        <v-template>
          <StackLayout orientation="vertical">
            <FlexboxLayout flexDirection="row" class="p-l-2">
              <!-- Black Bar -->
              <StackLayout backgroundColor="#1c1c1c" width="2%"></StackLayout>
              <StackLayout orientation="vertical" width="98%" class="p-l-4">
                <Label textWrap="true" class="p-b-10">
                  <FormattedString>
                    <Span :text="item.bodega" style="color: #1b1b1b" fontSize="25" />
                  </FormattedString>
                </Label>
                <Label textWrap="true" class="p-5">
                  <FormattedString>
                    <Span :text="item.nombre" style="color: #424242" fontSize="20" />
                  </FormattedString>
                </Label>
              </StackLayout>
            </FlexboxLayout>
          </StackLayout>
        </v-template>
      </ListView>
    </StackLayout>
  </Page>
</template>

<script>
  import Sqlite from 'nativescript-sqlite'
  import { mapActions } from 'vuex'

  export default {
    data() {
      return {
        status: 'Seleccionar Bodega',
        bodegas: []
      }
    },
    created() {
      this.fillWarehouses()
    },
    methods: {
      ...mapActions(['loadOn', 'loadOff']),
      
      pickThis(event) {
        this.$modal.close(event.item.bodega)
      },
      fillWarehouses() {
        if (Sqlite.exists('local')) {
          this.loadOn()
          var promise = new Sqlite('local', er => {
            if (er) { alert(er) }
          })

          promise.then(db => {
            db.resultType(Sqlite.RESULTSASOBJECT)
            db.all('select * from bodegas order by bodega', [], (er, res) => {
              if (!er) {
                if (res.length > 0) {
                  this.bodegas = res
                } else {
                  this.status = 'No se encontraron bodegas'
                }
              } else { alert(er) }
            })

            // Close connection
            db.close();
          })

          this.loadOff()
        } else { alert('No existe la base de datos local') }
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

  .accent-bg {
    background: $accent-dark;
  }

  .scc-yellow {
    color: $scc-yellow;
  }
</style>
