import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { DialogContent } from "@/components/ui/dialog";
import { DialogHeader } from "@/components/ui/dialog";
import { DialogTitle } from "@/components/ui/dialog";
import { DynamicForm } from "../common/form/dynamic-form";
import { listSchema, List } from "@/types/list";
import { FieldConfig } from "../common/form/dynamic-form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { useConfigurableMutation } from "@/hooks/useApiCalls";
import { postAxiosForUseFetch,putAxiosForUseFetch } from "@/lib/axios";
import { useFetch } from "@/hooks/useApiCalls";
import { getAxiosForUseFetch } from "@/lib/axios";
import API_PATH from "@/lib/apiPath";
import { useEffect } from "react";
import { z } from "zod";

type ListFormValues = z.infer<typeof listSchema>;

export default function CreateList({
  onClose,
  open,
  listId,
}: {
  onClose: () => void;
  open: boolean;
  listId?: string;
}) {
  const formFields: FieldConfig<ListFormValues>[] = [
    {
      name: "name",
      placeholder: "Enter list name",
      label: "Name",
      type: "text",
    },
    {
      name: "description",
      placeholder: "Enter list description",
      label: "Description",
      type: "text",
    },
    {
      name: "color",
      label: "Color",
      type: "color",
    },
  ];

  const {data : list} = useFetch<List>(
    getAxiosForUseFetch,
    ["tagList", listId as string],
    {
      url: { template: API_PATH.TAGS.GET_TAG, variables: [listId as string] },
    },
    {
      enabled: !!listId,
    }
  )



  useEffect(() => {
    if (list) {
      form.reset({
        name: list.name,
        description: list.description || "",
        color: list.color || "",
      });
    }
  }, [list]);

  const { mutate: createList, isPending } = useConfigurableMutation(
    postAxiosForUseFetch,
    ["tagList"],
    {
      onSuccess: () => {
        form.reset();
        onClose();
      },
    }
  );

  const {mutate : updateList, isPending : updatePending} = useConfigurableMutation(
    putAxiosForUseFetch,
    ["tagList"],
    {
      onSuccess: () => {
        form.reset();
        onClose();
      },
    }
  );
  const form = useForm<ListFormValues>({
    resolver: zodResolver(listSchema),
    defaultValues: {
      name: "",
      description: "",
      color: "",
    },
  });

  const handleSubmit = (data: ListFormValues) => {
    if(listId){
      updateList({
        url: { template: API_PATH.TAGS.UPDATE_TAG, variables: [listId as string] },
        data,
      });
    }else{
      createList({
        url: { template: API_PATH.TAGS.CREATE_TAG },
        data,
      });
    }
  };
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{listId ? "Edit List" : "Create List"}</DialogTitle>
          <DialogDescription>
            Create or edit a list to store your contacts.
          </DialogDescription>
        </DialogHeader>
        <DynamicForm form={form} fields={formFields} onSubmit={handleSubmit}>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </DialogClose>
            <Button 
            type="submit"
            disabled={isPending || updatePending}>
              {isPending || updatePending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DynamicForm>
      </DialogContent>
    </Dialog>
  );
}
