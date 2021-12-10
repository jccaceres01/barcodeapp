<template>
  <Page>
    <ActionBar class="action-bar">
      <NavigationButton text="Atras" android.systemIcon="ic_menu_back" @tap="$navigateBack" />
      <Label text="Nueva Boleta" fontSize="20" android.position="actionBar" />
    </ActionBar>

    <ScrollView orientation="vertical">
      <StackLayout orientation="vertical" style="padding: 20">
        <ActivityIndicator :busy="$store.state.loading" v-if="$store.state.loading" />
          <!-- articulo -->
          <StackLayout orientation="horizontal" width="100%">
            <TextField v-model="newTicket.articulo" hint="Articulo" keyboardType="text" width="80%" editable="false"/>
            <Button @tap="readBarcode" width="20%">
              <Span class="fas" text.decode="&#xf13a; "/>
            </Button>
          </StackLayout>

          <!-- bodega -->
          <StackLayout orientation="horizontal">
            <TextField v-model="newTicket.bodega" hint="Bodega" keyboardType="text" width="80%" editable="false" />
            <Button @tap="pickWarehouse" width="20%">
              <Span class="fas" text.decode="&#xf13a; "/>
            </Button>
          </StackLayout>

          <!-- locatio -->
          <StackLayout orientation="horizontal">
            <TextField v-model="newTicket.localizacion" hint="Localizacion" keyboardType="text" width="80%" editable="false" />
            <Button @tap="pickLocation" width="20%">
              <Span class="fas" text.decode="&#xf13a; "/>
            </Button>
          </StackLayout>

          <!-- Cantidad -->
          <TextField v-model="newTicket.cant" hint="Cantidad"  keyboardType="number"/>

          <!-- freeze exists -->
          <StackLayout orientation="horizontal">
            <Label text="Congelar Existencias" width="70%" />
            <Switch v-model="itemEnabled" @checkedChange="clearFreezeDate" text="Congelar Existencias" width="30%" />
          </StackLayout>

          <!-- fecha_descong -->
          <StackLayout orientation="horizontal" v-show="itemEnabled">
            <TextField v-model="newTicket.fecha_descong" hint="Fecha Descongelacion" keyboardType="date"  width="80%" editable="false" />
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
  import { Http, HttpResponse } from '@nativescript/core'
  import { mapActions } from 'vuex'
  import ReadBarcode from './dialogs/ReadBarcode'
  import StorageSelect from '../Outputs/OutputsDialogs/StorageSelect'
  import PickLocations from './dialogs/PickLocations'
  import PickDate from './dialogs/PickDate'

  export default {
    created() {
      this.fillWarehouses()
    },
    props: ['parent'],
    data() {
      return {
        api: conf.api,
        rdBarcode: ReadBarcode,
        stSelect: StorageSelect,
        lcSelect: PickLocations,
        pickDateDialog: PickDate,
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
      ...mapActions(['loadOn', 'loadOff']),

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
        this.$showModal(this.stSelect, {fullscreen: true}).then(res => {
          this.newTicket.bodega = res.BODEGA
        })
      },
      async pickLocation() {
        try {
          let con = await this.$showModal(this.lcSelect, {
            fullscreen: true,
            props: { warehouse: this.newTicket.bodega }, 
          })

          if (con) {
            this.newTicket.localizacion = con.LOCALIZACION
          } else {
            alert('Debe seleccionar una bodega')
          }
        } catch (error) { alert(error) }
      },
      pickDate() {
        this.$showModal(this.pickDateDialog).then(res => {
          this.newTicket.fecha_descong = res
        })
      },
      async saveTicket() {
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
          try {
            let res = await Http.request({
              url: `${this.api}/inventory/ticket`,
              method: 'POST',
              headers: { 'Content-Type': 'application/json'},
              content: JSON.stringify({
                articulo: this.newTicket.articulo,
                bodega: this.newTicket.bodega,
                localizacion: this.newTicket.localizacion,
                cant: this.newTicket.cant,
                fecha_descong: this.newTicket.fecha_descong
              })
            })

            if (res.content.toJSON() == 'added') {
              alert('Boleta Agregada')
              this.parent.filltickets()
              this.$navigateBack()
            } else if (res.content.toJSON() == 'exists') {
              alert('Esta boleta existe')
              this.$navigateBack()
            }
          } catch (error) { alert(error) }
          this.loadOff()
        }
      },
      clearFreezeDate() {
        if (this.itemEnabled == false) {
          this.newTicket.fecha_descong = null
        }
      },
      async fillWarehouses() {
        this.loadOn()
        try {
          let res = await Http.getJSON(`${this.api}/bodega`)
          this.warehouses = res || []
        } catch (error) { alert(error) }
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
