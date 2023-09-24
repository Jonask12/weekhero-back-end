import { getHours, isBefore } from "date-fns";
import { schedulesDTO } from "../dtos/schedulesDTO";
import { startOfHour } from "date-fns/fp";
import { SchedulesRepository } from "../repositories/SchedulesRepository";


class SchedulesService {
  private schedulesRepository: SchedulesRepository;
  constructor() {
    this.schedulesRepository = new SchedulesRepository()
  }

  async create({ name, phone, date, user_id }: schedulesDTO) {
    const dateFormatted = new Date(date);
    const hourStart = startOfHour(dateFormatted);

    const hour = getHours(hourStart);
    if (hour <= 9 || hour >= 19) {
      throw new Error('Create schedule between 9 and 19');
    }

    // verificando se o cliente está tentando agendar um horário com uma data retroativa
    if (isBefore(hourStart, new Date())) {
      throw new Error('It is not allowed to schedule old date');
    }

    // verificando se já existe um cliente com horário agendado no mesmo horário que outro está tentando agendar
    const checkIsAvailable = await this.schedulesRepository.find(hourStart, user_id);
    if (checkIsAvailable) {
      throw new Error('Schedule date is not available');
    }

    const schedule = await this.schedulesRepository.create({
      name,
      phone,
      date: hourStart,
      user_id
    });

    return schedule;
  }

  async index(date: Date) {
    const result = await this.schedulesRepository.findAll(date);
    console.log(result);
    return result;
  }

  async update(id: string, date: Date, user_id: string) {
    const dateFormatted = new Date(date);
    const hourStart = startOfHour(dateFormatted)

    if (isBefore(hourStart, new Date())) {
      throw new Error('It is not allowed to schedule old date');
    }

    const checkIsAvailable = await this.schedulesRepository.find(hourStart, user_id);
    if (checkIsAvailable) {
      throw new Error('Schedule date is not available');
    }
    const result = await this.schedulesRepository.update(id, date);
    return result
  }

  async delete(id: string) {
    const result = await this.schedulesRepository.delete(id);
    return result;
  }
}

export { SchedulesService }