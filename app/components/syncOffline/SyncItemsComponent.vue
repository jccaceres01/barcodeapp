<template>
  <Page>
    <ActionBar title="Cod. Sin Conexión" class="action-bar">
      <NavigationButton text="Atras" android.systemIcon="ic_menu_back" @tap="$navigateBack" />
      <ActionItem @tap="fillScanned"
        text="Actualizar Lista"
        ios.systemIcon="2" ios.position="right"
        android.systemIcon="ic_menu_refresh"
        android.position="popup" />
      <ActionItem @tap="clearScanned"
        text="Limpiar Escaneados"
        ios.systemIcon="2" ios.position="right"
        android.systemIcon="ic_menu_refresh"
        android.position="popup" />
    </ActionBar>

    <!-- Status label -->
    <StackLayout orientation="horzontal">
      <ActivityIndicator :busy="busy" @busyChange="" v-show="busy" />
      <Label textWrap="true" v-show="busy" verticalAlignment="center" horizontalAlignment="center">
        <FormattedString>
          <Span class="fas" text.decode="&#xf06a;" />
          <Span :text="status" class="" fontSize="20" />
        </FormattedString>
      </Label>
      <!-- Action buttons for list -->
      <FlexboxLayout flexDirection="row">
        <Button @tap="$navigateTo(newItems)" style="width: 50%">
          <FormattedString>
            <Span class="fas" text.decode="&#xf0fe;" fontSize="20" />
            <Span text.decode="&#xa;" />
            <Span text="Escanear Nuevo" class="fas"/>
          </FormattedString>
        </Button>
        <Button @tap="uploadScanned" style="width: 50%" >
            <FormattedString>
              <Span class="fas" text.decode="&#xf093;" fontSize="20" />
              <Span text.decode="&#xa;" />
              <Span text="Subir Escaneados" class="fas" />
            </FormattedString>
        </Button>
      </FlexboxLayout>

      <!-- Searchbox to filter list -->
      <TextField v-model="criteria" hint="Filtrar Escaneados" @textChange="" @returnPress="" keyboardType="Text" class="p-10" v-show="(this.scanned.length > 0)" />
      <ListView for="(item, index) in filtered" @itemTap="onItemTap" v-show="!ifItemSeleceted" v-if="this.scanned.length > 0">
        <v-template>
          <FlexboxLayout backgroundColor="black" flexDirection="row" class="p-10">
            <StackLayout width="80%">
                <Label textWrap="true">
                  <FormattedString>
                    <Span class="fas" text.decode="&#xf192;" style="color: #ffffff" />
                    <Span text="Código Softland: " class="fas" style="color: #ffffff" />
                    <Span :text="item.articulo" style="color: #ffffff" textWrap="true" />
                  </FormattedString>
                </Label>
                <Label textWrap="true">
                  <FormattedString>
                    <Span class="fas" text.decode="&#xf192;" style="color: #ffffff" />
                    <Span text="Descripción: " class="fas" style="color: #ffffff" />
                    <Span text.decode="&#xa;" />
                    <Span :text="item.descripcion" style="color: #ffffff" textWrap="true" />
                  </FormattedString>
                </Label>
                <Label textWrap="true">
                  <FormattedString>
                    <Span class="fas" text.decode="&#xf192;" style="color: #ffffff" />
                    <Span text="Cod. De Barras: " class="fas" style="color: #ffffff" />
                    <Span text.decode="&#xa;" />
                    <Span :text="item.codigo_barras_invt" style="color: #ffffff" textWrap="true" />
                  </FormattedString>
                </Label>
            </StackLayout>
            <Button @tap="removeItem(item, index)" width="20%">
              <Span class="fas" text.decode="&#xf1f8;" style="color: #ffffff"/>
            </Button>
          </FlexboxLayout>
        </v-template>
      </ListView>
      <Label text="No hay Escaneados para subir" fontSize="20" class="p-20" v-else  verticalAlignment="center" horizontalAlignment="center" />
    </StackLayout>
  </Page>
</template>

<script>
  import axios from 'axios'
  import Sqlite from 'nativescript-sqlite'
  import Configuration from '../../customconfig.json'
  import SyncNewItemsComponent from './SyncNewItemsComponent'

  export default {
    data() {
      return {
        api: Configuration.api,
        busy: false,
        status: '',
        criteria: '',
        scanned: [],
        newItems: SyncNewItemsComponent, // Intent to add new offline scanned
      }
    },
    computed: {
      filtered() {
        return this.scanned.filter(fil => {
          return (fil.articulo.toLowerCase().trim().indexOf(this.criteria.toLowerCase().trim()) !== -1) ||
            (fil.descripcion.toLowerCase().trim().indexOf(this.criteria.toLowerCase().trim()) !== -1)
        })
      }
    },
    mounted() {
      this.fillScanned()
    },
    methods: {
      loadOn() { this.busy = true },
      loadOff() {
        this.busy = false
        this.status = ''
      },
      fillScanned() {
        this.loadOn()
        this.status = 'Obteniendo escaneados...'
        // Check if local db exists
        if (Sqlite.exists('local')) {
          let db_promise = new Sqlite('local', er => {
            if (er) { alert(er) }
          })
          // get escaneados from db local
          db_promise.then( db => {
            db.resultType(Sqlite.RESULTSASOBJECT)
            db.all('select * from escaneados', (er, res) => {
              this.scanned = []
              this.scanned = res
            })
          })
        } else {
          alert('No existe la base de datos local')
        }

        this.loadOff()
      },
      // Remoe item from scanned list
      removeItem(item, index) {
        confirm('Borrar este escaneado?')
          .then(result => {
            if (result) {
              if (Sqlite.exists('local')) {
                this.loadOn()
                this.status = 'Borrando respuesto de la lista de escaneados'
                let promise = new Sqlite('local', (er, db) => {
                  if (er) { alert(er) }
                })

                promise.then(db => {
                  db.execSQL('delete from escaneados where articulo = ?', [item.articulo], (er) => {
                    if (!er) {
                      this.scanned.splice(index, 1)
                    } else { alert(er) }
                  })

                  db.close()

                  this.status = ''
                  this.loadOff()
                })
              } else { alert('No existe la base de datos local') }
            }
          });
      },
      //  Upload escanados
      async uploadScanned() {

        this.loadOn()
        this.status = 'Subiendo Escaneados...'

        var ops = []
        var response_dt = null

        try {
          for (var i = 0; i < this.scanned.length; i++) {
            this.status = 'Subiendo escaneado: '+i+ ' de '+this.scanned.length
            let op = await axios.put(this.api+'articulos/'+this.scanned[i].articulo, {
              'CODIGO_BARRAS_VENT': this.scanned[i].codigo_barras_vent,
              'CODIGO_BARRAS_INVT': this.scanned[i].codigo_barras_invt
            })

            ops.push(op)
          }

          let out = await axios.all(ops)
          alert('Escaneados Subidos')
        } catch (e) {
          alert(e)
        }

        this.loadOff()
        this.status = ''
      },
      // Clean scanned
      clearScanned() {

        confirm('Desea borrar los escaneados?')
          .then(result => {
            if (result) {
              if (Sqlite.exists('local')) {
                this.loadOn()
                this.status = 'Limpiando tabla de escaneados'

                var promise = new Sqlite('local', (er, db) => {
                  if (er) { alert(er) }
                })

                promise.then(db => {
                  db.execSQL('delete from escaneados', (er, id) => {
                    if (!er) {
                      alert('Escaneados borrados...')
                    } else { alert(er) }
                  })
                })

                this.loadOff()
                this.status = ''
                this.fillScanned()
              } else { alert('No existe la base de datos local') }
            }
          });
      }
    }
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
