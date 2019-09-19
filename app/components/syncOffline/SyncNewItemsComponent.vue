<template>
  <Page>
    <ActionBar title="Agregar Código Offline" class="action-bar">
      <NavigationButton text="Atras" android.systemIcon="ic_menu_back" @tap="$navigateBack" />
    </ActionBar>

    <StackLayout orientation="vertical">
      <ActivityIndicator :busy="busy" @busyChange="" v-show="busy" />
      <SearchBar hint="Buscar Repuesto" v-model="criteria" @textChange="" @submit="doSearch" />
      <!--  -->
      <ListView for="(item, index) in searchList" @itemTap="onItemTap" height="100%"  v-show="!ifItemSeleceted">
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
      <!-- item selected -->
      <FlexboxLayout backgroundColor="black" flexDirection="row" v-show="ifItemSeleceted" class="p-10">
        <StackLayout width="100%">
            <Label textWrap="true">
              <FormattedString>
                <Span class="fas" text.decode="&#xf192;" style="color: #ffffff" />
                <Span text="Código Softland: " class="fas" style="color: #ffffff" />
                <Span :text="itemSelected.articulo" style="color: #ffffff" />
              </FormattedString>
            </Label>
            <Label textWrap="true">
              <FormattedString>
                <Span class="fas" text.decode="&#xf192;" style="color: #ffffff" />
                <Span text="Descripción: " class="fas" style="color: #ffffff" />
                <Span  text.decode="&#xa;" />
                <Span :text="itemSelected.descripcion" style="color: #ffffff" />
              </FormattedString>
            </Label>
            <Label textWrap="true">
              <FormattedString>
                <Span class="fas" text.decode="&#xf192;" style="color: #ffffff" />
                <Span text="Cod. Barras Inventario: " class="fas" style="color: #ffffff" />
                <Span text.decode="&#xa;" />
                <Span :text="itemSelected.codigo_barras_invt" style="color: #ffffff" wrapText="true" />
              </FormattedString>
            </Label>
            <Label textWrap="true">
              <FormattedString>
                <Span class="fas" text.decode="&#xf192;" style="color: #ffffff" />
                <Span text="Cod. Barras Ventas: " class="fas" style="color: #ffffff" />
                <Span text.decode="&#xa;" />
                <Span :text="itemSelected.codigo_barras_vent" style="color: #ffffff" wrapText="true" />
              </FormattedString>
            </Label>
        </StackLayout>
      </FlexboxLayout>
      <!-- No item selected label -->
      <Label text="No ha seleccionado un respuesto" fontSize="20" verticalAlignment="center" horizontalAlignment="center" class="p-20" v-show="!ifItemSeleceted"/>
      <!-- Actions buttons -->
      <FlexboxLayout flexDirection="row" v-show="ifItemSeleceted">
        <Button @tap="clearItem" width="50%">
          <FormattedString>
            <Span class="fas" text.decode="&#xf2f1;" fontSize="40" />
            <Span text.decode="&#xa;"/>
            <Span text="Deseleccionar Repuesto" class="fas" />
          </FormattedString>
        </Button>
        <Button @tap="scanCode" width="50%">
          <FormattedString>
            <Span class="fas" text.decode="&#xf02a;" fontSize="40" />
            <Span text.decode="&#xa;"/>
            <Span text="Escanear Código" class="fas" />
          </FormattedString>
        </Button>
      </FlexboxLayout>
      <Button @tap="addToList" v-show="ifItemSeleceted" isEnable="false">
        <FormattedString>
          <Span class="fas p-10" text.decode="&#xf0fe;" fontSize="40" />
          <Span text.decode="&#xa;"/>
          <Span text="Agregar a la lista" class="fas" />
        </FormattedString>
      </Button>
    </StackLayout>
  </Page>
</template>

<script>
  import Sqlite from 'nativescript-sqlite'
  import PickBarcodeComponent from './dialogs/PickBarcodeComponent'

  export default {
    data() {
      return {
        busy: false,
        status: '',
        criteria: '',
        searchList: [],
        itemSelected: {
          articulo: '',
          descripcion: '',
          clasificacion_2: '',
          codigo_barras_invt: '',
          codigo_barras_vent: ''
        },
        pickBarcode: PickBarcodeComponent
      }
    },
    computed: {
      ifItemSeleceted() {
        return (this.itemSelected.articulo !== '')
      }
    },
    methods: {
      loadOn() { this.busy = true },
      loadOff() {
        this.busy = false
        this.status = ''
      },
      // Clear items list
      clearList() {
        this.searchList = []
      },
      doSearch() {
        this.loadOn()
        // Check if local db exists
        if (Sqlite.exists('local')) {
          let db_promise = new Sqlite('local', er => {
            if (er) { alert('alert') }
          })

          // find searchList with criteria data
          db_promise.then(db => {
            db.resultType(Sqlite.RESULTSASOBJECT)
            db.all('select * from articulo where descripcion like ? or'+
            ' articulo like ?',['%'+this.criteria+'%', '%'+this.criteria+'%'],
             (er, res) => {
              if (!er) {
                if (res.length > 0) {
                  this.searchList = res
                } else { alert('No se econtraron repuestos') }
              } else { alert(er) }
            })
          })
          this.loadOff()
        } else { alert('No existe la base de datos local') }
      },
      // Pick item from list
      onItemTap(event) {
        this.itemSelected = event.item
      },
      // Clear selected item
      clearItem() {
        // Reset itemSelected
        this.itemSelected = {
          articulo: '',
          descripcion: '',
          clasificacion_2: '',
          codigo_barras_invt: '',
          codigo_barras_vent: ''
        }

        this.clearList() // then clear list
        this.criteria = '' // Also clear criteria
      },
      // Read barcode for selected item.
      addToList() {
        if (this.itemSelected.codigo_barras_invt.trim() !== '') {
          if (Sqlite.exists('local')) {
            this.loadOn()
            this.status = 'Insertando nuevo codigo a la db local'

            let promise = new Sqlite('local', (er, db) => {
              if (er) { alert(er) }
            })

            promise.then(db => {
              // Insert into escaneados new scaned value
              db.execSQL('insert into escaneados (articulo, descripcion, codigo_barras_vent, codigo_barras_invt) values (?, ?, ?, ?)', [this.itemSelected.articulo, this.itemSelected.descripcion, this.itemSelected.codigo_barras_vent, this.itemSelected.codigo_barras_invt], (er, id) => {
                if (er) { alert(er) }
              })
              // update the new scanned value into the local db
              db.execSQL('update articulo set codigo_barras_invt = ?, codigo_barras_vent = ? where articulo = ?', [this.itemSelected.codigo_barras_invt, this.itemSelected.codigo_barras_vent, this.itemSelected.articulo], (er, id) => {
                if (er) { alert(er) }
              })

              db.close() // Close db after operations
            })

            this.loadOff()
            this.$navigateBack()
          } else { alert('No existe la base de datos local') }
        } else { alert('Debe agregar el código de barras') }
      },
      // Scan barcode dialog show
      scanCode() {
        this.$showModal(this.pickBarcode).then(res => {
          this.itemSelected.codigo_barras_invt = res
          this.itemSelected.codigo_barras_vent = res
        })
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
