import ImageIcon from "@mui/icons-material/Image";
import DescriptionIcon from "@mui/icons-material/Description";
import FolderIcon from "@mui/icons-material/Folder";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import React from "react";

export interface FileIconProps {
    fileName: string;
}

export const FileIcon: React.FC<FileIconProps> = ({ fileName }) => {
    const extension = fileName.split('.').pop()?.toLowerCase();

    // 图片文件
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension || '')) {
        return <ImageIcon sx={{ color: 'primary.main' }} />;
    }

    // 文本文件
    if (['txt', 'md', 'json', 'xml', 'html', 'css', 'js', 'ts'].includes(extension || '')) {
        return <DescriptionIcon sx={{ color: 'primary.main' }} />;
    }

    // 文件夹（这里假设文件夹名称没有扩展名）
    if (!extension) {
        return <FolderIcon sx={{ color: 'primary.main' }} />;
    }

    // 其他文件类型
    return <InsertDriveFileIcon sx={{ color: 'primary.main' }} />;
};
