import { useEffect, useState } from "react";
import { curseforgeApi, modrinthApi, type ModMetadata } from "~/api";
import { ModPicker } from "../common/ModPicker";
import {
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  styled,
} from "@mui/material";
import { Icon, CurseforgeIcon, ModrinthIcon } from "../common";

// ================================================================

export function HomePage() {
  const [value, setValue] = useState<ModMetadata[]>([]);

  useEffect(() => {
    console.log(`value`, value);
  }, [value]);

  return (
    <>
      <ModPicker value={value} onChange={(_, newValue) => setValue(newValue)} />
      <List>
        {value.map(item => (
          <ListItem key={item.slug}>
            <ListItemIcon>
              <Icon src={item.image} />
            </ListItemIcon>
            <ListItemText>
              <Grid container spacing={4} alignItems="center">
                {item.name}
                {item.curseforge && <CurseforgeIcon />}
                {item.modrinth && <ModrinthIcon />}
              </Grid>
            </ListItemText>
          </ListItem>
        ))}
      </List>
    </>
  );
}
