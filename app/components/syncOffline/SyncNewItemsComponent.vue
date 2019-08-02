<template>
  <Page>
    <ActionBar title="Agregar Código Offline" class="action-bar">
      <NavigationButton text="Atras" android.systemIcon="ic_menu_back" @tap="$navigateBack" />
    </ActionBar>

    <StackLayout orientation="vertical">
      <ActivityIndicator :busy="busy" @busyChange="" v-show="busy" />
      <SearchBar hint="Buscar Repuesto" v-model="criteria" @textChange="" @submit="doSearch" />
      <ListView for="item in searchList" @itemTap="onItemTap" v-show="!ifItemSeleceted">
        <v-template>
          <FlexboxLayout flexDirection="row">
            <Label width="20%" verticalAlignment="center" horizontalAlignment="center" fontSize="50">
              <Span class="fas" text.decode="&#xf013;" verticalAlignment="center" horizontalAlignment="center"/>
            </Label>
            <StackLayout class="list-group-item" width="80%">
              <Label :text="item.articulo" class="list-group-item-heading fas" fontSize="20" />
              <Label :text="item.descripcion" class="list-group-item-text" style="color: #878787" />
            </StackLayout>
          </FlexboxLayout>
        </v-template>
      </ListView>
      <!-- item selected -->
      <FlexboxLayout backgroundColor="black" flexDirection="row" height="20%" v-show="ifItemSeleceted" class="p-10">
        <Label width="20%" horizontalAlignment="center" verticalAlignment="center">
          <Span text.decode="&#xf013;" class="fas thumb p-16" fontSize="60" style="color: #ffffff" />
        </label>
        <StackLayout width="80%">
            <Label>
              <FormattedString>
                <Span class="fas" text.decode="&#xf192;" style="color: #ffffff" />
                <Span text="Código Softland: " class="fas" style="color: #ffffff" />
                <Span :text="itemSelected.articulo" style="color: #ffffff" />
              </FormattedString>
            </Label>
            <Label>
              <FormattedString>
                <Span class="fas" text.decode="&#xf192;" style="color: #ffffff" />
                <Span text="Descripción: " class="fas" style="color: #ffffff" />
                <Span  text.decode="&#xa;" />
                <Span :text="itemSelected.descripcion" style="color: #ffffff" />
              </FormattedString>
            </Label>
            <Label>
              <FormattedString>
                <Span class="fas" text.decode="&#xf192;" style="color: #ffffff" />
                <Span text="Cod. Barras Inventario: " class="fas" style="color: #ffffff" />
                <Span text.decode="&#xa;" />
                <Span :text="itemSelected.codigo_barras_invt" style="color: #ffffff" wrapText="true" />
              </FormattedString>
            </Label>
            <Label>
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
            db.all("select * from articulo where descripcion like ?",['%'+this.criteria+'%'], (er, res) => {
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
