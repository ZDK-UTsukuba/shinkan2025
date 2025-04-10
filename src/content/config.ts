import { z, defineCollection } from "astro:content";

const timetableCollection = defineCollection({
  type: "data",
  schema: z.array(
    z.object({
      title: z.string(),
      id: z.number().nullable(),
      startsAt: z.string().time(),
      endsAt: z.string().time(),
    })
  ),
});

export const collections = {
  timetable: timetableCollection,
};
