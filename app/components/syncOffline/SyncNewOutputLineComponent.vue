<template>
  <Page>
    <ActionBar class="action-bar">
      <Label :text="'SAL-'+salida.id.toString().padStart(6, '0')" fontSize="20" verticalAlignment="left" horizontalAlignment="left" />
      <NavigationButton text="Atras" android.systemIcon="ic_menu_back" @tap="$navigateBack" />
      <ActionItem @tap="fillLines"
        ios.systemIcon="2" ios.position="right"
        android.systemIcon="ic_menu_refresh" />
      <ActionItem @tap="addNewLine"
        ios.systemIcon="2" ios.position="right"
        android.systemIcon="ic_menu_add" />
    </ActionBar>

    <StackLayout orientation="vertical">
      <!-- Concurency -->
      <ActivityIndicator :busy="busy" @busyChange="" v-show="busy" />
      <Label textWrap="true" v-show="busy" verticalAlignment="center" horizontalAlignment="center">
        <FormattedString>
          <Span class="fas" text.decode="&#xf06a;" />
          <Span :text="status" class="" fontSize="20" />
        </FormattedString>
      </Label>
      <!-- Searchbox to filter list -->
      <SearchBar hint="filtrar Lineas" v-model="criteria" @textChange="" @submit="" />
      <Label text="No hay Lineas" fontSize="20" horizontalAlignment="center" verticalAlignment="center" padding="10" v-show="!(this.outputLines.length > 0)" />
      <!-- List of items to sync with server -->
      <ListView for="(item, index) in filtered" @itemTap="showDesc(item, index)" height="100%">
        <v-template>
          <StackLayout orientation="vertical" verticalAlignment="center" horizontalAlignment="center" @longPress="deleteThis(item, index)">
            <FlexboxLayout flexDirection="row" class="p-l-2">
              <StackLayout backgroundColor="#1c1c1c" width="2%"></StackLayout>
              <FlexboxLayout flexDirection="row" width="48%">
                <StackLayout orientation="vertical" paddingLeft="7">
                  <Label text="Linea No.: " fontSize="16" fontWeight="bold" />
                  <Label :text="(index + 1).toString().padStart(3, '0')" fontSize="12" textWrap="true" />
                  <Label text="Descripción: " fontSize="16" fontWeight="bold" />
                  <Label :text="item.descripcion" fontSize="12" textWrap="true" />
                  <Label text="Cantidad: " fontSize="16" fontWeight="bold" />
                  <Label :text="item.cantidad" fontSize="12" textWrap="true" />
                  <Button text="" @tap="deleteThis(item, index)">
                    <Span class="fas" text.decode="&#xf2ed;"/>
                  </Button>
                </StackLayout>
              </FlexboxLayout>
              <FlexboxLayout flexDirection="row" width="48%" paddingLeft="7">
                <StackLayout orientation="vertical">
                  <Label text="Articulo: " fontSize="16" fontWeight="bold" />
                  <Label :text="item.articulo" fontSize="12" textWrap="true" />
                  <Label text="Bodega: " fontSize="16" fontWeight="bold" />
                  <Label :text="item.bodega" fontSize="12" textWrap="true" />
                  <Label text="Localización: " fontSize="16" fontWeight="bold" />
                  <Label :text="item.localizacion" fontSize="12" textWrap="true" />
                </StackLayout>
              </FlexboxLayout>
            </FlexboxLayout>
          </StackLayout>
        </v-template>
      </ListView>
    </StackLayout>
  </Page>
</template>

<script>
import Sqlite from 'nativescript-sqlite'
import SyncNewOutputLineFormComponent from './SyncNewOutputLineFormComponent'

export default {
  data() {
    return {
      busy: false,
      status: '',
      criteria: '',
      outputLines: [],
      newLine: SyncNewOutputLineFormComponent
    }
  },
  props: ['salida'],
  mounted() {
    // Fill lines
    this.fillLines()
  },
  computed: {
    filtered() {
      return this.outputLines.filter(cb => {
        return (cb.articulo.toLowerCase().trim().indexOf(this.criteria.toLowerCase().trim()) !== -1) ||
          (cb.descripcion.toLowerCase().trim().indexOf(this.criteria.toLowerCase().trim()) !== -1) ||
          (cb.descripcion.toLowerCase().trim().indexOf(this.criteria.toLowerCase().trim()) !== -1)
      })
    }
  },
  methods: {
    loadOn() { this.busy = true },
    loadOff() { this.busy = false},
    // Show modal to add new line
    addNewLine(output) {
      this.$navigateTo(this.newLine, {props: {salida: this.salida}})
    },
    // Fill lines
    fillLines() {
      // Show concurrency
      this.loadOn()
      this.status = 'Consultando lineas'

      // Check if local db exists
      if (Sqlite.exists('local')) {
        // Open local db
        var promise = new Sqlite('local', er => {
          if (er) { alert(er) }
        })

        // insert newLine data to local db
        promise.then(db => {
          // Set result as object
          db.resultType(Sqlite.RESULTSASOBJECT)
          //  Get output lines
          db.all('select lineas_salida.*, articulo.descripcion from lineas_salida inner join articulo on lineas_salida.articulo = articulo.articulo where salida_id = ?', [this.salida.id], (er, res) => {
            if (!er) {
              this.outputLines = res
            } else { alert(er) }
          })
        })

        // close connection
        promise.then(db => {
          db.close()
        })

        // hide concurrency
        this.loadOff()
        this.status = ''
      }
    },
    // Delete item
    deleteThis(item, index) {
      confirm('Borrar esta linea?')
        .then(result => {
          if (result) {
            // Show concurrency
            this.loadOn()
            this.status = 'Borrando Linea...'
            // Check local db
            if (Sqlite.exists('local')) {
              // Open connection
              var promise = new Sqlite('local', er => {
                if (er) { alert(er) }
              })

              // delete the item
              promise.then(db => {
                db.execSQL('delete from lineas_salida where id = ?', [item.id], (er, id) => {
                  if (!er) {
                    this.outputLines.splice(index, 1)
                  } else { alert(er) }
                })
              })

              // Hide concurrency
              this.loadOff()
              this.status = ''

            } else { alert('No existe la base de datos local') }
          }
        });
    },
    showDesc(item, index) {
      alert(item.descripcion)
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
