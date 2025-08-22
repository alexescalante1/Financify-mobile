export type CategoryRelationType =
  | "activo"     // Recursos que posee el usuario
  | "pasivo"     // Deudas u obligaciones
  | "consumo"    // Bienes que se consumen directamente
  | "servicio"   // Servicios contratados o recurrentes
  | "otros";     // Cualquier otro tipo no clasificado