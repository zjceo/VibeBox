// Archivo de declaración de tipos para los screens
// Este archivo permite que TypeScript compile los archivos .tsx sin errores

declare module '*.tsx' {
  const component: React.ComponentType<any>;
  export default component;
}

declare module '*.ts' {
  const value: any;
  export default value;
}
