import { Avatar, Box, List, ListItem, ListItemIcon, ListItemText } from "@mui/material";
import { FileIcon } from "./FileIcon";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import React from "react";
import { FileInfo } from "../types";

export interface CompletedFilesListProps {
    data: Array<FileInfo>; // 已完成文件列表
}

export const CompletedFilesList: React.FC<CompletedFilesListProps> = ({ data }) => {
    return (
        <List>
            {data.map((file, index) => (
                <ListItem key={index}>
                    <ListItemIcon>
                        <Box sx={{ position: 'relative' }}>
                            <Avatar sx={{ bgcolor: 'background.paper' }}>
                                <FileIcon fileName={file.name} />
                            </Avatar>
                            <CheckCircleIcon
                                sx={{
                                    position: 'absolute',
                                    bottom: -4,
                                    right: -4,
                                    color: 'success.main',
                                    fontSize: '1.2rem',
                                    bgcolor: 'background.paper',
                                    borderRadius: '50%'
                                }}
                            />
                        </Box>
                    </ListItemIcon>
                    <ListItemText
                        primary={file.name}
                        secondary={`${(file.size / 1024 / 1024).toFixed(2)} MB`}
                    />
                </ListItem>
            ))}
        </List>
    )
}
