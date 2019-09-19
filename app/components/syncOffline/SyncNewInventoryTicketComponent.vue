<template>
  <Page>
    <ActionBar class="action-bar">
      <NavigationButton text="Atras" android.systemIcon="ic_menu_back" @tap="$navigateBack" />
      <Label text="Nueva Boleta Sin Conexión" fontSize="20" android.position="actionBar" />
    </ActionBar>

    <ScrollView orientation="vertical">
      <StackLayout orientation="vertical" style="padding: 20">
        <ActivityIndicator :busy="busy" @busyChange="" v-show="busy" />
          <!-- articulo -->
          <StackLayout orientation="horizontal" width="100%">
            <TextField v-model="newTicket.articulo" hint="Articulo" @textChange="" @returnPress="" keyboardType="text" width="80%" editable="false"/>
            <Button @tap="getItem" width="20%">
              <Span class="fas" text.decode="&#xf13a; "/>
            </Button>
          </StackLayout>

          <!-- bodega -->
          <StackLayout orientation="horizontal">
            <TextField v-model="newTicket.bodega" hint="Bodega" @textChange="" @returnPress="" keyboardType="text" width="80%" editable="false" />
            <Button @tap="pickWarehouse" width="20%">
              <Span class="fas" text.decode="&#xf13a; "/>
            </Button>
          </StackLayout>

          <!-- locatio -->
          <StackLayout orientation="horizontal">
            <TextField v-model="newTicket.localizacion" hint="Localizacion" @textChange="" @returnPress="" keyboardType="text" width="80%" editable="false" />
            <Button @tap="pickLocation" width="20%">
              <Span class="fas" text.decode="&#xf13a; "/>
            </Button>
          </StackLayout>

          <!-- Cantidad -->
          <TextField v-model="newTicket.cant" hint="Cantidad" @textChange="" @returnPress="" keyboardType="number"/>

          <!-- freeze exists -->
          <StackLayout orientation="horizontal">
            <Label text="Congelar Existencias" width="70%" />
            <Switch v-model="itemEnabled" @checkedChange="clearFreezeDate" text="Congelar Existencias" width="30%" />
          </StackLayout>

          <!-- fecha_descong -->
          <StackLayout orientation="horizontal" v-show="itemEnabled">
            <TextField v-model="newTicket.fecha_descong" hint="Fecha Descongelacion" @textChange="" @returnPress="" keyboardType="Date"  width="80%" editable="false" />
            <Button @tap="pickDate" width="20%">
              <Span class="fas" text.decode="&#xf13a; "/>
            </Button>
          </StackLayout>

          <!-- Save new Inventory Ticket -->
          <Button text="Agregar Boleta" @tap="saveOfflineTicket" />
      </StackLayout>
    </ScrollView>
  </Page>
</template>

<script>
  import conf from '../../customconfig.json'
  import Sqlite from 'nativescript-sqlite'
  import PickOfflineItemComponent from './dialogs/PickOfflineItemComponent'
  import PickOfflineWarehouseComponent from './dialogs/PickOfflineWarehouseComponent'
  import PickOfflineLocationComponent from './dialogs/PickOfflineLocationComponent'
  import PickDate from '../inventory/dialogs/PickDate'
  import moment from 'moment'

  export default {
    created() {
      // this.getWarehouses()
    },
    data() {
      return {
        apiUrl: conf.api,
        busy: false,
        itemEnabled: false,
        criteria: '',
        offLineItem: PickOfflineItemComponent,
        offLineWarehouse: PickOfflineWarehouseComponent,
        offLocation: PickOfflineLocationComponent,
        pd: PickDate,
        newTicket:  {
          articulo: null,
          descripcion: null,
          bodega: null,
          localizacion: null,
          cant: '',
          fecha_descong: null
        }
      }
    },
    methods: {
      loadOn() { this.busy = true },
      loadOff() { this.busy = false},
      clearAll() {
        this.newTicket.articulo = null
        this.newTicket.bodega = null
        this.newTicket.localizacion = null
        this.newTicket.cant = null
        this.newTicket.fecha_descong = null
        this.busy = false
      },
      getItem() {
        this.$showModal(this.offLineItem).then( res => {
          this.newTicket.articulo = res.articulo
          this.newTicket.descripcion = res.descripcion
        })
      },
      pickWarehouse() {
        this.$showModal(this.offLineWarehouse).then( res => {
          this.newTicket.bodega = res
        })
      },
      pickLocation() {
        if (this.newTicket.bodega != null) {
          this.$showModal(this.offLocation, {props: {bodega: this.newTicket.bodega}}).then( res => {
            this.newTicket.localizacion = res
          })
        } else {
          alert('Debe de seleccionar una bodega')
        }
      },
      pickDate() {
        this.$showModal(this.pd).then( res => {
          this.newTicket.fecha_descong = moment(res).format('YYYY-MM-DD')
        })
      },
      clearFreezeDate() {
        if (this.itemEnabled == false) {
          this.newTicket.fecha_descong = null
        }
      },
      saveOfflineTicket() {
        this.loadOn()

        if (
          this.newTicket.articulo != null &&
          this.newTicket.bodega != null &&
          this.newTicket.localizacion != null &&
          this.newTicket.cant != null
        ) {
          if (Sqlite.exists('local')) {
            var promise = new Sqlite('local', er => {
              if (er) { alert(er) }
            })

            if (this.newTicket.fecha_descong != null) {
              promise.then(db => {
                db.execSQL('insert into boletas (articulo, descripcion, bodega, localizacion, cantidad, fecha_descong) values (?, ?, ?, ?, ?, ?)', [this.newTicket.articulo, this.newTicket.descripcion, this.newTicket.bodega, this.newTicket.localizacion, this.newTicket.cant, this.newTicket.fecha_descong], er => {
                  if (er) { alert(er) }
                })
              })

              alert('Boleta creada')
            } else {
              promise.then(db => {
                db.execSQL('insert into boletas (articulo, descripcion, bodega, localizacion, cantidad) values (?, ?, ?, ?, ?)', [this.newTicket.articulo, this.newTicket.descripcion, this.newTicket.bodega, this.newTicket.localizacion, this.newTicket.cant], er => {
                  if (er) { alert(er) }
                })
              })

              alert('Boleta creada')
            }

            this.$navigateBack()

          } else {
            alert('Advertencia: No existe la base de datos local')
          }
        } else {
          alert('No puede dejar campos vacios')
        }

        this.loadOff()
      }
    }
  }
</script>

<style lang="scss" scoped>
  // Start custom common variables
  @import '../../app-variables';
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
</style>
