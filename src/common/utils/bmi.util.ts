export function calculateBMI(heightM: number, weightKg: number): { bmi: number; status: string } {
  if (!heightM || !weightKg) {
    throw new Error("Altura e peso são obrigatórios para o cálculo do IMC.");
  }

  const bmi = Number((weightKg / (heightM * heightM)).toFixed(2));

  let status = "";

  if (bmi < 16) status = "Magreza grave";
  else if (bmi < 17) status = "Magreza moderada";
  else if (bmi < 18.5) status = "Magreza leve";
  else if (bmi < 25) status = "Peso normal";
  else if (bmi < 30) status = "Sobrepeso";
  else if (bmi < 35) status = "Obesidade grau I";
  else if (bmi < 40) status = "Obesidade grau II";
  else status = "Obesidade grau III (mórbida)";

  return { bmi, status };
}