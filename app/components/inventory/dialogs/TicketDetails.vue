<template>
  <Page>
    <ActionBar title="Detalle de Boleta" class="action-bar">
      <NavigationButton text="Atras" android.systemIcon="ic_menu_back" @tap="$navigateBack" />
    </ActionBar>

    <StackLayout orientation="vertical">
      <ActivityIndicator :busy="$store.state.loading" v-if="$store.state.loading" />
      <!-- Boleta -->
      <Label grapText="true">
        <Span text="Boleta: " class="fa info" />
        <Span :text="this.ticket.BOLETA" style="color: #868686" />
      </Label>
      <!-- Articulo -->
      <Label grapText="true">
        <Span text="Articulo: " class="fa info" />
        <Span :text="this.ticket.ARTICULO" style="color: #868686" />
      </Label>
      <!-- Descripcion -->
      <Label grapText="true">
        <Span text="Descripcion: " class="fa info" />
        <Span :text="this.ticket.DESCRIPCION" style="color: #868686" />
      </Label>
      <!-- Bodega -->
      <Label grapText="true">
        <Span text="Bodega: " class="fa info" />
        <Span :text="this.ticket.BODEGA" style="color: #868686" />
      </Label>
      <!-- Localizacion -->
      <Label grapText="true">
        <Span text="Localizacion: " class="fa info" />
        <Span :text="this.ticket.LOCALIZACION" style="color: #868686" />
      </Label>
      <!-- Lote -->
      <Label grapText="true">
        <Span text="Lote: " class="fa info" />
        <Span :text="this.ticket.LOTE" style="color: #868686" />
      </Label>
      <!-- CANT_DISP_RESERV -->
      <Label grapText="true">
        <Span text="Cant. Disponible Reserva: " class="fa info" />
        <Span :text="this.ticket.CANT_DISP_RESERV" style="color: #868686" />
      </Label>
      <!-- CANT_NO_APROBADA -->
      <Label grapText="true">
        <Span text="Cant. No aprovada: " class="fa info" />
        <Span :text="this.ticket.CANT_NO_APROBADA" style="color: #868686" />
      </Label>
      <!-- CANT_VENCIDA -->
      <Label grapText="true">
        <Span text="Cant. Vencida: " class="fa info" />
        <Span :text="this.ticket.CANT_VENCIDA" style="color: #868686" />
      </Label>
      <!-- Validada -->
      <Label grapText="true">
        <Span text="Validada: " class="fa info" />
        <Span :text="this.ticket.VALIDADA" style="color: #868686" />
      </Label>
      <!-- SERIE_CADENA_DISP -->
      <Label grapText="true">
        <Span text="Serie Cadena Disponible: " class="fa info" />
        <Span :text="this.ticket.SERIE_CADENA_DISP" style="color: #868686" />
      </Label>
      <!-- SERIE_CADENA_NOAPR -->
      <Label grapText="true">
        <Span text="Serie Cadena no aprovada: " class="fa info" />
        <Span :text="this.ticket.SERIE_CADENA_NOAPR" style="color: #868686" />
      </Label>
      <!-- SERIE_CADENA_VENC -->
      <Label grapText="true">
        <Span text="Serie Cadena Vencida: " class="fa info" />
        <Span :text="this.SERIE_CADENA_VENC" style="color: #868686" />
      </Label>
      <Button text="Borrar Boleta" @tap="delTicket" />
    </StackLayout>
  </Page>
</template>

<script>
  import conf from '../../../customconfig.json'
  import { Http } from '@nativescript/core'
  import { mapActions } from 'vuex'

  export default {
    data() {
      return {
        api: conf.api,
      }
    },
    props: {
      ticket: {Type: Object, required: true},
      parent: {Type: Object}
    },
    methods: {
      ...mapActions(['loadOn', 'loadOff']),

      async delTicket() {
        let con = await confirm('¿Desea Borrar Esta Boleta?')
        if (con) {
          this.loadOn()
          try {
            let res = await Http.request({
              url: `${this.api}/inventory/ticket/${this.ticket.BOLETA}`,
              method: 'DELETE',
              headers: {'Content-Type': 'application/json'}
            })

            if (res.statusCode === 200) {
              alert('Boleta Borrada')
              this.parent.filltickets()
              this.$navigateBack()
            }
          } catch (error) { alert(error) }
          this.loadOff()
        }
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

  .desc {
    font-size: 16;
    color: #747474;
  }

  .info {
      font-size: 20;
  }
</style>
