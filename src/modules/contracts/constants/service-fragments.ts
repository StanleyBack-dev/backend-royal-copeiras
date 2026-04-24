export function normalizeServiceType(value?: string): string {
  if (!value) return "";
  try {
    return value
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .toLowerCase()
      .trim();
  } catch {
    return String(value).toLowerCase().trim();
  }
}

const SERVICE_FRAGMENT_MAP: Record<string, string> = {
  copeira:
    "zelar pela organização e limpeza do ambiente, incluindo salão, auditório e banheiros, bem como reposição de materiais e higienização",
  garcom:
    "prestar atendimento de mesas, serviço de bebidas e alimentação, incluindo anotações de pedidos e retirada de utensílios",
  seguranca:
    "promover o controle de acesso, patrulhamento e vigilância das dependências do evento, com foco na preservação da integridade de pessoas e bens",
  porteiro:
    "controlar entradas e saídas, orientar visitantes e supervisionar a guarda de acessos",
  deslocamento:
    "efetuar o transporte de equipe e/ou material entre endereços acordados, conforme cronograma e instruções do contratante",
  recepcionista:
    "realizar credenciamento e acolhimento de convidados, fornecendo informações e orientações aos participantes",
  monitor:
    "supervisionar atividades, prestar apoio operacional e acompanhar público ou áreas específicas durante o evento",
};

export function getFragmentForServiceType(value?: string): string {
  const key = normalizeServiceType(value);
  return (
    SERVICE_FRAGMENT_MAP[key] ||
    "atuar durante o evento, com foco na execucao do servico contratado"
  );
}
