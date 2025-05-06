import { TextField } from "@mui/material";
import Button from "@mui/material/Button";
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Modal } from "~/components/common/Modal";
import { DataContext } from "~/context";
import type { ValueAndSetter } from "~/utils";

//================================================

export type CreatePackModalProps = ValueAndSetter<"open", boolean>;

export function CreatePackModal({ open, setOpen }: CreatePackModalProps) {
  const navigate = useNavigate();
  const [name, setName] = useState("");

  const { addPack } = useContext(DataContext);

  return (
    <Modal
      id="create-pack-modal"
      open={open}
      onClose={() => {
        setOpen(false);
        setName("");
      }}
      titleText="Create New Mod Pack"
      confirmButton={
        <Button
          onClick={() => {
            addPack({ name, mods: [] });
            navigate(`/${encodeURIComponent(name)}`);
            setOpen(false);
          }}
        >
          Create
        </Button>
      }
      cancelButton={<Button>Cancel</Button>}
    >
      <TextField
        name="pack-name"
        value={name}
        onChange={e => setName(e.target.value)}
        label="Name"
        placeholder="Name"
        size="small"
        sx={{
          marginBlock: theme => theme.spacing(2),
        }}
      />
    </Modal>
  );
}
