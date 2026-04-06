from database.dbTable import db, Pose

def save_pose_to_db(pose_name, target_vector):
    new_pose = Pose(
        pose_name=pose_name,
        target_vector=target_vector
    )
    db.session.add(new_pose)
    db.session.commit()
    return new_pose

def get_pose_by_id(pose_id):
    return Pose.query.get(pose_id)