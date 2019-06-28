<template>
  <Page>
    <ActionBar class="action-bar">
      <NavigationButton text="Atras" android.systemIcon="ic_menu_back" @tap="$navigateBack" />
      <Label text="Nueva Boleta" fontSize="20" android.position="actionBar" />
    </ActionBar>

    <ScrollView orientation="vertical">
      <StackLayout orientation="vertical" style="padding: 20">
        <ActivityIndicator :busy="busy" @busyChange="" v-show="busy" />
          <!-- articulo -->
          <StackLayout orientation="horizontal" width="100%">
            <TextField v-model="newTicket.articulo" hint="Articulo" @textChange="" @returnPress="" keyboardType="text" width="80%" editable="false"/>
            <Button @tap="readBarcode" width="20%">
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
            <TextField v-model="newTicket.fecha_descong" hint="Fecha Descongelacion" @textChange="" @returnPress="" keyboardType="date"  width="80%" editable="false" />
            <Button @tap="pickDate" width="20%">
              <Span class="fas" text.decode="&#xf13a; "/>
            </Button>
          </StackLayout>

          <!-- Save new Inventory Ticket -->
          <Button text="Agregar Boleta" @tap="saveTicket" />
      </StackLayout>
    </ScrollView>
  </Page>
</template>

<script>
  import conf from '../../customconfig.json'
  import axios from 'axios'
  import ReadBarcode from './dialogs/ReadBarcode'
  import StorageSelect from '../Outputs/OutputsDialogs/StorageSelect'
  import PickLocations from './dialogs/PickLocations'
  import PickDate from './dialogs/PickDate'

  export default {
    created() {
      axios.get(this.apiUrl+'bodega').then(res => {
        this.warehouses = res.data
      }).catch(er => {
        alert(er)
      })
    },
    data() {
      return {
        apiUrl: conf.api,
        rdBarcode: ReadBarcode,
        stSelect: StorageSelect,
        lcSelect: PickLocations,
        pickDateDialog: PickDate,
        busy: false,
        itemEnabled: false,
        criteria: '',
        newTicket:  {
          articulo: null,
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
      readBarcode() {
        this.$showModal(this.rdBarcode).then(data => {
          this.newTicket.articulo = data
        })
      },
      pickWarehouse() {
        this.$showModal(this.stSelect).then(res => {
          this.newTicket.bodega = res.BODEGA
        })
      },
      pickLocation() {
        if (this.newTicket.bodega !== null) {
          this.$showModal(this.lcSelect, {
            props: { warehouse: this.newTicket.bodega }
          }).then(res => {
            this.newTicket.localizacion = res.LOCALIZACION
          })
        } else {
          alert('Debe seleccionar una bodega')
        }
      },
      pickDate() {
        this.$showModal(this.pickDateDialog).then(res => {
          this.newTicket.fecha_descong = res
        })
      },
      saveTicket() {
        if (this.newTicket.articulo == null) {
          alert('Debe de ingresar el repuesto')
        } else if (this.newTicket.bodega == null) {
          alert('Debe de ingresar la bodega')
        } else if (this.newTicket.localizacion == null) {
          alert('Debe de ingresar la localizacion')
        } else if (this.newTicket.cant.trim() == '') {
          alert('Debe de ingresar una cantidad')
        } else if (this.itemEnabled == true &&
            this.newTicket.fecha_descong == null) {
            alert('Debe de ingresar la fecha de descongelacion')
        } else {
          this.loadOn()
          axios.post(this.apiUrl+'inventory/ticket', {
            articulo: this.newTicket.articulo,
            bodega: this.newTicket.bodega,
            localizacion: this.newTicket.localizacion,
            cant: this.newTicket.cant,
            fecha_descong: this.newTicket.fecha_descong
          }).then(res => {
            if (res.data == 'added') {
              this.loadOff()
              alert('Boleta Agregada')
              this.$navigateBack()
            } else if (res.data == 'exists') {
              this.loadOff()
              alert('Esta boleta existe')
              this.$navigateBack()
            }
          }).catch(er => {
            alert(er)
            this.clearAll()
          })
        }
      },
      clearFreezeDate() {
        if (this.itemEnabled == false) {
          this.newTicket.fecha_descong = null
        }
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
