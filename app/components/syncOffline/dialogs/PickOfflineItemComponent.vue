<template>
  <Page>
    <ActionBar class="action-bar" title="Seleccionar Repuesto" />

    <StackLayout orientation="vertical">
      <Label text="Seleccionar Repuesto" fontSize="30" textWrap="true" class="accent-bg scc-yellow" />
      <ActivityIndicator :busy="$store.state.loading" v-if="$store.state.loading" />
      <SearchBar hint="Buscar Repuesto" v-model="criteria" @submit="findItem" />
      <!-- Status label -->
      <Label :text="status" fontSize="18" textWrap="true" v-show="searchList.length <= 0" verticalAlignment="center" horizontalAlignment="center" class="p-5" />
      <!-- List  of items -->
      <ListView for="(item, index) in searchList" @itemTap="pickThis" height="100%">
        <v-template>
          <StackLayout orientation="vertical">
            <FlexboxLayout flexDirection="row" class="p-l-2">
              <!-- Black Bar -->
              <StackLayout backgroundColor="#1c1c1c" width="2%"></StackLayout>
              <StackLayout orientation="vertical" width="98%" class="p-l-4">
                <Label textWrap="true" class="p-b-10">
                  <FormattedString>
                    <Span :text="item.articulo" style="color: #1b1b1b" fontSize="25" />
                    <Span text="(" fontSize="18" />
                    <Span :text="item.descripcion" fontSize="18" />
                    <Span text=")" fontSize="18" />
                  </FormattedString>
                </Label>
                <FlexboxLayout flexDirection="row">
                  <StackLayout orientation="verticla" width="50%">
                    <Label text="Cod. Barras Venta: " fontSize="14" style="color: #1b1b1b; font-weight: bold" />
                    <Label :text="item.codigo_barras_vent" textWrap="true" fontSize="10" />
                    <Label text="Original: " fontSize="14" style="color: #1b1b1b; font-weight: bold" />
                    <Label v-if="(item.clasificacion_2 == '02-01')">
                      <FormattedString>
                        <Span class="fas" text.decode="&#xf058;"/>
                      </FormattedString>
                    </Label>
                    <Label v-else>
                      <FormattedString>
                        <Span class="fas" text.decode="&#xf057;"/>
                      </FormattedString>
                    </Label>
                  </StackLayout>
                  <StackLayout orientation="verticla" width="50%">
                    <Label text="Cod Barras Inventario: " fontSize="14" style="color: #1b1b1b; font-weight: bold" />
                    <Label :text="item.codigo_barras_invt" textWrap="true" fontSize="10" />
                  </StackLayout>
                </FlexboxLayout>
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
        status: '',
        criteria: '',
        searchList: []
      }
    },
    created() {
      this.status = 'Repuesto no seleccionado'
    },
    methods: {
      ...mapActions(['loadOn', 'loadOff']),

      findItem() {
        if (Sqlite.exists('local')) {
          this.loadOn()
          var promise = new Sqlite('local', er => {
            if (er) { alert(er) }
          })

          promise.then(db => {
            db.resultType(Sqlite.RESULTSASOBJECT)
            db.all('select * from articulo where articulo like ? or descripcion like ? or codigo_barras_invt like ?', ['%'+this.criteria+'%', '%'+this.criteria+'%', '%'+this.criteria+'%'], (er, res) => {
              if (res.length > 0 ) {
                this.searchList = res
              } else {
                this.searchList = []
                this.status = 'Repuesto no Encontrado'
              }
            })

            db.close()
            this.loadOff()
          })
        } else { alert('No existe la base de datos local') }
      },
      pickThis(event) {
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
