export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500
};

export const REGEX_PATTERNS = {
  NOMBRE: /^[a-zA-ZéíóúÁÉÍÓÚñÑ\s'-]{2,80}$/,
  TEXTO_GENERAL: /^[a-zA-Z0-9éíóúÁÉÍÓÚñÑ\s\-.,&/#():;+°]{3,500}$/,
  URL_RUTA: /^\/[a-zA-Z0-9\-_/]+$/,
  CODIGO_ROL: /^[A-Z0-9_]{3,30}$/,
  DNI_RUC: /^\d{8,11}$/,
  TELEFONO: /^9\d{8}$|^\d{7,9}$/,
  EMAIL: /^[\w.\-+]+@[\w\-]+\.[a-zA-Z]{2,}$/,
  USERNAME: /^[a-zA-Z0-9_]{4,25}$/,
  PASSWORD: /^\S{5,30}$/
};

export class RegexConstants {
  static number(event: any): void {
    event.target.value = event.target.value.replace(/\D/g, '');
  }

  static name(event: any): void {
    event.target.value = event.target.value.replace(/[^a-zA-ZéíóúÁÉÍÓÚñÑ\s'-]/g, '');
  }

  static text(event: any): void {
    event.target.value = event.target.value.replace(/[^a-zA-Z0-9éíóúÁÉÍÓÚñÑ\s\-.,&/#]/g, '');
  }

  static address(event: any): void {
    event.target.value = event.target.value.replace(/[^a-zA-Z0-9éíóúÁÉÍÓÚñÑ\s\-,.#/]/g, '');
  }

  static email(event: any): void {
    event.target.value = event.target.value.replace(/[^\w@.\-+]/g, '');
  }

  static username(event: any): void {
    event.target.value = event.target.value.replace(/[^a-zA-Z0-9_]/g, '');
  }

  static password(event: any): void {
    // Elimina espacios en blanco en la contraseña
    event.target.value = event.target.value.replace(/\s/g, '');
  }

  static routeUrl(event: any): void {
    event.target.value = event.target.value.replace(/[^a-zA-Z0-9\-_/]/g, '');
  }
}