<template>
  <Page>
    <StackLayout orientation="vertical">
      <Label text="Nueva Salida" fontSize="30" class="accent-bg scc-yellow" fontWeight="bold" />
      <StackLayout orientation="vertical" padding="20">
        <TextField v-model="referencia" hint="Introdusca el Número Interno" keyboardType="Text" maxLength="6" id="ni-field" />
        <Label text="Seleccionar Centro de Costo: " fontSize="18" paddingTop="20" fontWeight="bold" />
        <ListPicker :items="costCenters" v-model="selectedItem" />
        <Button text="Agregar Nuevo" @tap="addNew" >
          <FormattedString>
            <Span class="fas" text.decode="&#xf055; "/>
            <Span text=" Agregar Nuevo" />
          </FormattedString>
        </button>
      </StackLayout>
    </StackLayout>
  </Page>
</template>

<script>
export default {
  data() {
    return {
      referencia: '',
      selectedItem: 0,
      costCenters: [
        {
          id: '01-02-11',
          value: 'Pueblo Viejo (LLD-SD1  El Llagal)',
          toString: () => {
            return 'Pueblo Viejo (LLD-SD1  El Llagal)'
          }
        },
        {
          id: '01-02-13',
          value: 'Pueblo Viejo (Minería)',
          toString: () => {
            return 'Pueblo Viejo (Minería)'
          }
        },
        {
          id: '01-02-14',
          value: ' H.S.E.- PVDC',
          toString: () => {
            return ' H.S.E.- PVDC'
          }
        },
        {
          id: '01-02-16',
          value: 'Excavación de Frente Minero - FALCONDO',
          toString: () => {
            return 'Excavación de Frente Minero - FALCONDO'
          }
        }
      ]
    }
  },
  methods: {
    // Return new output data
    addNew() {
      this.$modal.close({
        referencia: this.referencia,
        centroCosto: this.costCenters[this.selectedItem]
      })
    }
  }
}
</script>

<style lang="scss" scoped >
  // Start custom common variables
  @import '../../../app-variables';
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

  #ni-field {
    text-transform: uppercase;
  }

  .accent-bg {
    background: $accent-dark;
  }

  .scc-yellow {
    color: $scc-yellow;
  }
</style>
