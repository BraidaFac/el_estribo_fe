import * as yup from "yup";

export const suitSchema = yup.object({
  id: yup.string().required("El código es obligatorio"),
  color: yup.string().required("El color es obligatorio"),
  category: yup.string().required("La categoría es obligatoria"),
  brand: yup.string().required("La marca es obligatoria"),
  state: yup.string().optional(),
  size: yup
    .number()
    .typeError("El talle es obligatorio")
    .min(38, "Desde talle 38")
    .max(70, "Hasta talle 70")
    .required("El talle es obligatorio"),
});

export type SuitFormData = yup.InferType<typeof suitSchema>;
