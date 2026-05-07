import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { EntityManager, Repository } from "typeorm";
import { ContractsEntity } from "../../../contracts/entities/contracts.entity";
import { ContractStatus } from "../../../contracts/enums/contract-status.enum";
import { CustomersEntity } from "../../entities/customers.entity";
import { LeadsEntity } from "../../../leads/entities/leads.entity";
import { SignatureEntity } from "../../../signature/entities/signature.entity";

function onlyDigits(value?: string): string {
  if (!value) return "";
  return value.replace(/\D/g, "");
}

function normalizeDocument(value?: string): string | undefined {
  const digits = onlyDigits(value);
  if (digits.length === 11 || digits.length === 14) {
    return digits;
  }
  return undefined;
}

function inferCustomerType(document: string): "individual" | "company" {
  return document.length === 14 ? "company" : "individual";
}

@Injectable()
export class CreateCustomerFromSignedContractService {
  private readonly logger = new Logger(
    CreateCustomerFromSignedContractService.name,
  );

  constructor(
    @InjectRepository(CustomersEntity)
    private readonly customersRepository: Repository<CustomersEntity>,
    @InjectRepository(ContractsEntity)
    private readonly contractsRepository: Repository<ContractsEntity>,
    @InjectRepository(LeadsEntity)
    private readonly leadsRepository: Repository<LeadsEntity>,
    @InjectRepository(SignatureEntity)
    private readonly signaturesRepository: Repository<SignatureEntity>,
  ) {}

  async execute(
    contractId: string,
    manager?: EntityManager,
  ): Promise<CustomersEntity | null> {
    const contractsRepo = manager
      ? manager.getRepository(ContractsEntity)
      : this.contractsRepository;
    const customersRepo = manager
      ? manager.getRepository(CustomersEntity)
      : this.customersRepository;
    const leadsRepo = manager
      ? manager.getRepository(LeadsEntity)
      : this.leadsRepository;
    const signaturesRepo = manager
      ? manager.getRepository(SignatureEntity)
      : this.signaturesRepository;

    const contract = await contractsRepo.findOne({
      where: { idContracts: contractId },
      relations: { lead: true },
    });

    if (
      !contract ||
      ![
        ContractStatus.SIGNED,
        ContractStatus.CLOSED_WITHOUT_SIGNATURE,
      ].includes(contract.status)
    ) {
      return null;
    }

    if (contract.idCustomers) {
      const linked = await customersRepo.findOne({
        where: { idCustomers: contract.idCustomers },
      });
      if (linked) {
        return linked;
      }
    }

    const lead =
      contract.lead ||
      (contract.idLeads
        ? await leadsRepo.findOne({ where: { idLeads: contract.idLeads } })
        : null);

    let document = normalizeDocument(lead?.document);

    if (!document) {
      const signature = await signaturesRepo
        .createQueryBuilder("signature")
        .where("signature.idContracts = :idContracts", {
          idContracts: contract.idContracts,
        })
        .andWhere("signature.signed_by_document IS NOT NULL")
        .orderBy("signature.updatedAt", "DESC")
        .getOne();

      document = normalizeDocument(signature?.signedByDocument);
    }

    if (!document) {
      this.logger.warn(
        `Contrato ${contract.idContracts} assinado sem documento válido para criar cliente.`,
      );
      return null;
    }

    let customer = await customersRepo.findOne({ where: { document } });

    if (!customer) {
      customer = customersRepo.create({
        idUsers: contract.idUsers,
        name: lead?.name || "Cliente",
        document,
        type: inferCustomerType(document),
        email: lead?.email,
        phone: lead?.phone,
        isActive: true,
      });
      customer = await customersRepo.save(customer);
    }

    if (contract.idCustomers !== customer.idCustomers) {
      contract.idCustomers = customer.idCustomers;
      await contractsRepo.save(contract);
    }

    return customer;
  }
}
